let D3Table = (function () {
    let elemCount = 0,
        tables = [],
        movable = false,
        D3Table = {},
        element = {},
        __data = undefined,
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
            // save the location of obj2
            let parent2 = obj2.parentNode,
                next2 = obj2.nextSibling;
            // special case for obj1 is the next sibling of obj2
            if (next2 === obj1) {
                // just put obj1 before obj2
                parent2.insertBefore(obj1, obj2);
            } else {
                // insert obj2 right before obj1
                obj1.parentNode.insertBefore(obj2, obj1);

                // now insert obj1 where obj2 was
                if (next2) {
                    // if there was an element after obj2, then insert obj1 right before that
                    parent2.insertBefore(obj1, next2);
                } else {
                    // otherwise, just append as last child
                    parent2.appendChild(obj1);
                }
            }
        };

    this.dragStart = (e) => {
        let arr = getAllSiblings(e.srcElement),
            source = getPos(arr, e.srcElement);
        console.log(source, e.srcElement.tagName)
        e.dataTransfer.setData('source', source)
        e.dataTransfer.setData('sourceElm', e.srcElement)
        e.dataTransfer.setData('swap', e.srcElement.tagName)
    }

    this.dragEnter = (e) => {
        console.log('enter in drag enter')
        let arr = getAllSiblings(e.srcElement),
            target = getPos(arr, e.srcElement);
        e.dataTransfer.setData('target', target)
        console.log(target)
    }

    this.dragLeave = (e) => {
        console.log('Enter the drag leave zone')
    }

    this.drop = (e) => {
        console.log('item Now dropped')
        event.preventDefault();
        let targetIndex = e.dataTransfer.getData('target'),
            sourceIndex = e.dataTransfer.getData('source'),
            elm = e.srcElement;

        let arr = getAllSiblings(e.srcElement),
            swap = e.dataTransfer.getData('swap');
            targetIndex = getPos(arr, e.srcElement);

        if (targetIndex !== sourceIndex) { // we can swap nodes        
            let p = elm.parentNode,
                childs = p.childNodes;
            swapElements(childs[sourceIndex], childs[targetIndex])
            console.log('we can swap now ', swap)           
        }

        if(swap === 'TH'){
            tables[0]['tbody'].select(function(){
                //console.log(this.childNodes);
                // let childs = this.childNodes;
                // childs.each(function(c,i){
                //     console.log(c,i,this)
                // })
            });
            tables[0]['tbody'].selectAll('tr').each(function(){
                //console.log(this,this.childNodes[sourceIndex])
                childs = this.childNodes;
                swapElements(childs[sourceIndex], childs[targetIndex])
            })
        }
    }

    // create table    
    D3Table.createTable = (_parent, source) => {
        let parent = _parent || 'body',
            table = element.table = d3.select(parent).append('table').attr('class', 'd3table'),
            thead = element.thead = table.append('thead').attr('class', 'd3thead'),
            tbody = element.tbody = table.append('tbody').attr('class', 'd3tbody'),
            _data = source || __data,
            columns = _data.columns,
            data = _data.data,
            rows,
            cells;

        // append the header row
        thead.append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')
            .text(column => column)
            .attr("draggable", "true")
            .attr("ondragstart", "dragStart(event)")
            .attr("ondragenter", "dragEnter(event)")
            .attr("ondragleave", "dragLeave(event)")
            .attr("ondragover", "return false")
            .attr("ondrop", "drop(event)");

        // create a row for each object in the data
        rows = tbody.selectAll('tr')
            .data(data)
            .enter()
            .append('tr')

        // create a cell in each row for each column
        cells = rows.selectAll('td')
            .data(function (row) {
                return columns.map(function (column) {
                    return {
                        column: column,
                        value: row[column]
                    };
                });
            })
            .enter()
            .append('td')
            .text(function (d) {
                return d.value;
            });

        tables[elemCount] = element;
        elemCount++;
        element = {};

        return D3Table;
    };

    D3Table.movableTable = () => {
        movable = !movable;
        return D3Table;
    };

    D3Table.getElement = elem => {
        console.log(tables)
        return tables[elemCount - 1][elem];
    };

    D3Table.getData = path => {
        d3.json(path, function (error, _data) {
            data = _data;
        });
        return D3Table;
    };

    D3Table.status = () => {
        console.log(movable);
        return D3Table;
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
    }

    return {
        createTable: D3Table.createTable,
        move: D3Table.movableTable,
        getElement: D3Table.getElement,
        getData: D3Table.getData
    }
})();