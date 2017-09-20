let D3Table = (function () {
    let elemCount = 0,
        lastUsedId = '',
        parentElem = null,
        tables = [],
        mapper = {},
        movable = false,
        D3Table = {},
        __element = {},
        __data = undefined,
        _isColsSeparated = false,
        t = d3.transition()
                .duration(750),
        win = window,

        after = elm => {
            let p = elm.parentNode;
            p.insertBefore(elm, getPrvSib(elm, 1))
        },
        before = elm => {
            let p = elm.parentNode;
            p.insertBefore(elm, getNxtSib(elm, 2))
        },
        getPrvSib = (elm, ii) => {
            let __elm = elm;
            for (let i = 0; i < ii; i++) {
                let pElm = __elm.previousSibling;
                while (pElm && pElm.nodeType != 1) {
                    pElm = pElm.previousSibling;
                }
                __elm = pElm;
            }
            return __elm;
        },
        getNxtSib = (elm, ii) => {
            let __elm = elm;
            for (let i = 0; i < ii; i++) {
                let pElm = __elm.nextSibling;
                while (pElm && pElm.nodeType != null && pElm.nodeType != 1) {
                    pElm = pElm.nextSibling;
                }
                __elm = pElm;
            }
            return __elm;
        },
        getAllSiblings = elem => {
            return elem.parentNode.childNodes;
        },
        getPos = (ob, elem) => {
            for (let i in ob) {
                if (ob[i] === elem) {
                    return i;
                }
            }
            return false;
        },
        swapElements = (obj1, obj2) => {
            let parent2 = obj2.parentNode,
                next2 = obj2.nextSibling;
            next2 === obj1 ? parent2.insertBefore(obj1, obj2) :
                (obj1.parentNode.insertBefore(obj2, obj1),
                    next2 ? parent2.insertBefore(obj1, next2) : parent2.appendChild(obj1));
        },
        isArray = arr => Array.isArray(arr),
        isObject = val => {
            if (val === null) {
                return false;
            }
            return ((typeof val === 'function') || (typeof val === 'object'));
        };

    win.dragStart = (e) => {
        let arr = getAllSiblings(e.srcElement),
            source = getPos(arr, e.srcElement);
        // console.log(source, e.srcElement.tagName)
        e.dataTransfer.setData('source', source)
        e.dataTransfer.setData('sourceElm', e.srcElement)
        e.dataTransfer.setData('swap', e.srcElement.tagName)
    }

    win.dragEnter = (e) => {
        //console.log('enter in drag enter')
    }

    win.dragLeave = (e) => {
        //console.log('Enter the drag leave zone')
    }

    win.drop = (e) => {
        if (_isColsSeparated) {
            console.warn('Column Drag is not possible while columns are separated');
            return;
        }
        event.preventDefault();
        let sourceIndex = e.dataTransfer.getData('source'),
            elm = e.srcElement,
            arr = getAllSiblings(e.srcElement),
            swap = e.dataTransfer.getData('swap'),
            targetIndex = getPos(arr, e.srcElement);

        if (targetIndex !== sourceIndex) { // we can swap nodes        
            let p = elm.parentNode,
                childs = p.childNodes;
            swapElements(childs[sourceIndex], childs[targetIndex])
            if (swap === 'TH') {
                tables[0]['tbody'].selectAll('tr').each(function () {
                    childs = this.childNodes;
                    childs.length > 1 && swapElements(childs[sourceIndex], childs[targetIndex]);
                })
            }
        }
    };

    D3Table.update = data => {
        D3Table.createTable(parentElem, data, lastUsedId);
    };

    D3Table.rotateColumns = (cols, deg) => {
        let headers = d3.selectAll('#' + lastUsedId + '_d3thead_tr'),
            rows = d3.selectAll('.' + lastUsedId + '_d3tbody_rows');

        rows.selectAll('td').each(function (d, i) {
            let col = this;
            cols.forEach(n => {
                if ((i + 1) === n) {
                    d3.select(col).style('position', 'relative')
                            .style('writing-mode', 'vertical-lr')
                            .style("transform", "rotate(" + deg + "deg)");
                }
            });
        });

        headers.selectAll('th').each(function (d, i) {
            let col = this;
            cols.forEach(n => {
                if ((i + 1) === n) {
                    d3.select(col).style('position', 'relative')
                            .style('writing-mode', 'vertical-lr')
                            .style("transform", "rotate(" + deg + "deg)");
                }
            });
        });
    };

    /*
     * Add seperation
     * Params : arr,     // array of rowas
     *          distance // in px
     */
    D3Table.addblankRows = (arr, distance) => {
        let elem = d3.selectAll('.' + lastUsedId + '_d3tbody_rows'),
            _distance = distance ? (distance + 'px 0') : '10px 0';

        if (isArray(arr)) {
            arr.sort();
            arr.forEach(n => {
                elem.each(function (_d, i) {
                    if ((i + 1) === (n - 1)) {
                        let t = document.createElement('tr');
                        d3.select(t)
                            .append('TD')
                            .attr('class', 'blank separated');
                        this.parentNode.insertBefore(t, this.nextSibling);
                        // d3.select(this.parentNode).insert('tr', this).append('TD').attr('class', 'blank separate');
                    }
                })
            });

            d3.selectAll(".separated")
                .transition()
                .attr("delay", function (d, i) {
                    return 1000 * i
                })
                .attr("duration", function (d, i) {
                    return 1000 * (i + 1)
                })
                .style("padding", _distance);
        }
    };
    /*
     * Add seperation between table columns
     * Params : arr,     // array of rowas
     *          distance // in px
     */
    D3Table.addBlankColumns = (cols, distance) => {
        let _distance = distance ? ('0 ' + distance + 'px') : '0 10px';
        if (isArray(cols)) {
            let headers = d3.selectAll('#' + lastUsedId + '_d3thead_tr'),
                rows = d3.selectAll('.' + lastUsedId + '_d3tbody_rows');

            rows.selectAll('td').each(function (d, i) {
                let col = this;
                cols.forEach(n => {
                    if ((i + 1) === n) {
                        let t = document.createElement('td');
                        t.setAttribute('class', 'blank separated-cols')
                        col.parentNode.insertBefore(t, col.nextSibling);
                    }
                });
            });

            headers.selectAll('th').each(function (d, i) {
                let col = this;
                cols.forEach(n => {
                    if ((i + 1) === n) {
                        let t = document.createElement('th');
                        t.setAttribute('class', 'blank separated-cols')
                        col.parentNode.insertBefore(t, col.nextSibling);
                    }
                });
            });

            d3.selectAll(".separated-cols")
                .transition()
                .duration(2000)
                .style("padding", _distance)
                .transition()
                .ease(d3.easeBounce);

            _isColsSeparated = true;
        }
    }

    //remove separations
    D3Table.removeBlankRows = () => {
        let elm = d3.selectAll(".separated"),
            transitionEl = elm
            .transition()
            .attr("delay", function (d, i) {
                return 1000 * i
            })
            .attr("duration", function (d, i) {
                return 1000 * (i + 1)
            })
            .style("padding", "0");

        transitionEl
            .transition()
            .attr("delay", '1000')
            .attr("duration", '1000')
            .on('end', function () {
                elm.each(function () {
                    d3.select(this.parentNode).remove();
                })
            });
    };

    //remove separations
    D3Table.removeBlankColumns = () => {
        let elm = d3.selectAll(".separated-cols"),
            transitionEl = elm
                .transition()
                .attr("delay", function (d, i) {
                    return 1000 * i
                })
                .attr("duration", function (d, i) {
                    return 1000 * (i + 1)
                })
                .style("padding", "0");

        transitionEl
            .transition()
            .attr("delay", '1000')
            .on('end', function () {
                elm.each(function () {
                    d3.select(this).remove();
                })
            });

        _isColsSeparated = false;
    };
    // highLight method takes an object as an parameter
    /* ob = {
     *   cols : [1, 3],       // 1 and 3 will be highlighted 
     *   rows : [1, 2, 3, 5], // 1,2,3,5 th rows will be hightlighted
     *   bgcolor: '#ccc',    // preferred color hex, rgb
     *   duration: 1000.      // number in ms
     * }
     */
    D3Table.highLight = ob => {
        if (isObject(ob) && ob.rows) {
            let highLightColor = ob.bgcolor || 'rgba(12, 139, 187, 0.3)',
                cols = (ob.cols && ob.cols.sort()) || (arr => {
                    return arr.map((d, i) => {
                        return i + 1;
                    });
                })(D3Table.data.columns),
                rows = ob.rows.sort(),
                // selecting all the rows
                elem = d3.selectAll('.' + lastUsedId + '_d3tbody_rows');

            elem.each(function (d, i) {
                let row = d3.select(this),
                    _cols = row.selectAll('td');

                rows.forEach((dd) => {
                    if (dd === (i + 1)) { // row selected
                        cols.forEach(j => {
                            d3.select(_cols._groups[0][j])
                                .attr("class", lastUsedId + "_rows_cells highlighted")
                                .transition()
                                .attr("delay", "500")
                                .attr("duration", "500")
                                .style("background", highLightColor);
                        });
                    }
                });
            });
        }
    };

    D3Table.removeHighLights = () => {
        let elements = d3.selectAll('.d3tbody_rows_cells');
        elements.transition(t)
            .duration(2000)
            .each(function(d) {
                d3.select(this).style('background', '#fff');
            });
    };

    // create table
    /*
     * takes 3 parameters 
     *   appendTo (parent ELement), 
     *   Data ({cols: [], data: [{},{}]}),
     *   id (preferred id or default id)
     */
    D3Table.createTable = (_parent, source, _id) => {
        let id = lastUsedId || (lastUsedId = _id || 'D3table' + (elemCount + 1)),
            parent = parentElem = _parent || 'body',
            _parentElem = d3.select(parent),
            table = _parentElem.selectAll('#' + id).data([1]),
            thead,
            tbody,
            _data = source || __data,
            columns = _data.columns,
            data = _data.data,
            rows,
            cells,
            tr,
            th,
            exitFn = function (d) {
                let element = d3.select(this),
                    transitionEl = element.transition(t)
                        .ease(d3.easeLinear)
                        .duration("300")
                        .style('background', '#f0bd7f')

                transitionEl
                    .transition(t)
                        .ease(d3.easeLinear)
                        .duration("1000")
                        .style("opacity", 0)
                        .on('end', function () {
                            d3.select(this).remove();
                        });            
            },
            enterFn = function(){
                let ep = d3.select(this);

                ep.style("opacity", 0)
                    .transition(t)
                    .ease(d3.easeLinear)
                    .duration("1000")
                    .style("opacity", 1);};
            // enterTransition = updateTransition.transition().each(function() {
            //   div.enter().append("div")
            //       .text(function(d) { return d; })
            //       .style("opacity", 0)
            //     .transition()
            //       .style("background", "green")
            //       .style("opacity", 1);
            // });

        D3Table.data = source;
        table
            .exit()
            .remove();
        table = table
            .enter()
            .append('table')
            .merge(table)
            .attr('id', id)
            .attr('class', 'd3table');

        thead = table.selectAll('#' + id + '_d3thead').data([1]);
        thead
            .exit()
            .remove();
        thead = thead
            .enter()
            .append('thead')
            .merge(thead)
            .attr('id', id + '_d3thead')
            .attr('class', 'thead');

        __element.thead = thead;

        tr = thead.selectAll('#' + id + '_d3thead_tr').data([1]);
        tr
            .exit()
            .remove();
        tr = tr
            .enter()
            .append('tr')
            .merge(tr)
            .attr('id', id + '_d3thead_tr')
            .attr('class', 'd3thead tr')
            .attr("transform", "rotate(0)");

        th = tr.selectAll('#' + id + '_d3thead_th').data(columns);
        // th
        //     .exit()
        //     .each(exitFn);

        t.each(function() {
          th.exit()
              .style('background', '#f0bd7f')
            .transition()
                .duration(2000)
              .style("opacity", 0)
              .remove();
        });
        th = th
            .enter()
            .append('th')
            .attr("draggable", "true")
            .attr("ondragstart", "dragStart(event)")
            .attr("ondragenter", "dragEnter(event)")
            .attr("ondragleave", "dragLeave(event)")
            .attr("ondragover", "return false")
            .attr("ondrop", "drop(event)")
            .merge(th)
            .attr('id', id + '_d3thead_th')
            .attr('class', 'd3thead th')
            .text(d => d);

        tbody = table.selectAll('#' + id + '_d3tbody').data([1]);
        tbody
            .exit()
            .each(exitFn);
        tbody = tbody
            .enter()
            .append('tbody')
            .merge(tbody)
            .attr('id', id + '_d3tbody')
            .attr('class', 'd3tbody');
        __element.tbody = tbody;

        rows = tbody.selectAll('#' + id + '_d3body_rows').data(data);
        rows
            .exit()
            .each(exitFn);

        rows = rows
            .enter()
            .append('tr')
                .each(enterFn)
            .merge(rows)
            .attr("transform", "rotate(0)")
            .attr('id', id + '_d3body_rows')
            .attr('class', (d, i) => {
                return lastUsedId + '_d3tbody_rows'
            });

        cells = rows.selectAll('#' + id + '_d3body_rows_cells')
            .data(function (row) {
                return columns.map(function (column) {
                    return {
                        column: column,
                        value: row[column]
                    };
                });
            });

        cells
            .exit()
            .each(exitFn);

        // cells.style("opacity", 1)
        //      .transition(t);

        cells = cells
            .enter()
            .append('td')
            .on("mouseover", function () {

            })
            .on("mouseout", function () {

            })
            .merge(cells)
            .attr('id', id + '_d3body_rows_cells')
            .attr('class', 'd3tbody_rows_cells')
            .transition(t)
            .text(d => d.value);

        tables[elemCount] = __element;
        mapper[id] = elemCount;
        elemCount++;

        return D3Table;
    };

    D3Table.movableTable = () => {
        movable = !movable;
        return D3Table;
    };

    D3Table.getElement = elem => {
        return tables[elemCount - 1][elem];
    };

    D3Table.getData = path => {
        d3.json(path, function (error, _data) {
            data = _data;
        });
        return D3Table;
    };

    D3Table.allTables = () => {
        return tables;
    };

    D3Table.getTable = (id) => {
        return tables[mapper[id]];
    };

    D3Table.MoveUp = (row) => {
        row = row.parentNode;
        while (row != null) {
            if (row.nodeName == 'TR') {
                break;
            }
            row = row.parentNode;
        }
        after(row);
    };

    D3Table.MoveDown = (row) => {
        row = row.parentNode;
        while (row != null) {
            if (row.nodeName == 'TR') {
                break;
            }
            row = row.parentNode;
        }
        before(row);
    };

    D3Table.join = (dt1, dt2) => {
        let col1 = dt1.columns,
            col2 = dt2.columns;
    };

    /*
     * elem -> * = all cols, elem, [array of elems]
     */
    D3Table.select = (elem, condition) => {
        let _data = D3Table.data,
            sourceData = _data.data,
            cols = _data.columns,
            selectedElem = ((_, cols) => {
                if (typeof _ === 'string') {
                    if (_ === '*') {
                        return cols;
                    } else {
                        return cols.filter(function (word) {
                            return word === _;
                        });
                    }
                } else if (Array.isArray(_) && _.length > 1) {
                    return _;
                }
            })(elem, cols);

        if (condition && typeof condition === 'string') {
            let _con = read(condition),
                filtered = sourceData.filter(row => {
                    let args = [];
                    _con.params.forEach(d => {
                        args.push(row[d]);
                    });
                    if (_con.fn.apply(null, args)) {
                        return row;
                    }
                });

            sourceData = filtered;
            console.log(`filtered data: `, filtered);
        }

        function read(expression) {
            let variables = expression.match(/\$\w+/g),
                length = variables.length,
                uniqueVariables = [],
                index = 0;

            while (index < length) {
                let variable = variables[index++];
                if (uniqueVariables.indexOf(variable) < 0)
                    uniqueVariables.push(variable);
            }

            return {
                fn: Function.apply(null, uniqueVariables.concat("return " + expression)),
                params: (_ => {
                    return _.map(d => {
                        return d.slice(1);
                    })
                })(uniqueVariables)
            };
        }
        return {
            data: sourceData,
            columns: selectedElem
        }
    };

    return {
        createTable: D3Table.createTable,
        getElement: D3Table.getElement,
        getData: D3Table.getData
    }
})();

export {D3Table as default};