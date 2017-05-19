let D3Table = (function () {
    let movable = false,
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
        };
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
            .text(function (column) {
                return column;
            });

        // create a row for each object in the data
        rows = tbody.selectAll('tr')
            .data(data)
            .enter()
            .append('tr');

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

        return D3Table;
    };
    D3Table.movableTable = () => {
        movable = !movable;
        return D3Table;
    };
    D3Table.getElement = elem => {
        return element[elem];
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
        after(row);
    }

    return {
        createTable: D3Table.createTable,
        move: D3Table.movableTable,
        getElement: D3Table.getElement,
        getData: D3Table.getData
    }
})();