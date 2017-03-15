/* global d3  queue */

const props = {
  options: {
    valueVariable: 'value',
    sourceVariable: 'source',
    targetVariable: 'target'
  }
}

const options = props.options;
const valueVariable = options.valueVariable;
const sourceVariable = options.sourceVariable;
const targetVariable = options.targetVariable;

const table = d3.select('.table-container').append('table');
table.append('thead');
table.append('tbody');

queue()
  .defer(d3.json, 'graph.json')
  .await(ready);

function ready(error, inputData, stateface) {
  if (error) throw error;
  let tableData = inputData.links;
  tableData.map(d => d[valueVariable] = Number(d[valueVariable]));

  // sort descending by the valueVariable value
  tableData.sort((a, b) => b[valueVariable] - a[valueVariable]);

  // subset and only show the top 10 values
  tableData = tableData.slice(0, 10);

  const columns = [
    {
      head: valueVariable,
      cl: valueVariable,
      align: 'center',
      html(row) {
        const scale = d3.scaleThreshold()
          .domain([1, 2, 4, 6])
          .range([1, 2, 3, 4, 5]);

        const icon = '<span class="fa fa-male"></span>';
        const value = row[valueVariable];
        const text = `<span class='value'>${value}</span>`;
        return text;
      }
    },
    {
      head: sourceVariable,
      cl: sourceVariable,
      align: 'left',
      html(row) {
        const source = row[sourceVariable];
        const text = `<span class='title left'>${source}</span>`;
        return text;
      },
    },
    {
      head: '',
      cl: 'arrow',
      align: 'right',
      html(row) {
        const arrowLeft = `<span class='fa fa-arrow-left'></span>`;
        const arrowRight = `<span class='fa fa-arrow-right'></span>`;
        return arrowLeft + arrowRight;
      },
    },
    {
      head: targetVariable,
      cl: targetVariable,
      align: 'right',
      html(row) {
        const target = row[targetVariable];
        const text = `<span class='title'>${target}</span>`;
        return text;
      },
    }
  ];

  // global variables to hold selection state
  // out side of renderTable 'update' function
  let tableUpdate;
  let tableEnter;
  let tableMerge;

  table.call(renderTable);

  function renderTable(table) {
    console.log('arguments from renderTable', arguments);

    tableUpdate = table.select('thead')
        .selectAll('th')
          .data(columns)

    if (typeof tableUpdate !== 'undefined') {
      const tableExit = tableUpdate.exit();
      tableExit.remove()
    }

    tableEnter = tableUpdate
      .enter().append('th');

    tableEnter
      .attr('class', d => `${d.cl} ${d.align}`)
      .text(d => d.head)
      .on('click', (d) => {
        console.log('d from click', d);
        let ascending;
        if (d.ascending) {
          ascending = false;
        } else {
          ascending = true;
        }
        d.ascending = ascending;
        // console.log('ascending', ascending);
        // console.log('d after setting d.ascending property', d);
        // console.log('tableData before sorting', tableData);
        tableData.sort((a, b) => {
          if (ascending) {
            return d3.ascending(a[d.cl], b[d.cl]);
          }
          return d3.descending(a[d.cl], b[d.cl]);
        });
        // console.log('tableData after sorting', tableData);
        table.call(renderTable);
      });

    if (typeof trUpdate !== 'undefined') {
      const trExit = trUpdate.exit();
      trExit.remove()
    }
    trUpdate = table.select('tbody').selectAll('tr')
      .data(tableData);

    tableMerge = tableUpdate.merge(tableEnter);

    trEnter = trUpdate.enter().append('tr');

    trMerge = trUpdate.merge(trEnter)
      .on('mouseenter', mouseenter)
      .on('mouseleave', mouseleave);

    const tdUpdate = trMerge.selectAll('td')
      .data((row, i) => columns.map((c) => {
        const cell = {};
        d3.keys(c).forEach((k) => {
          cell[k] = typeof c[k] === 'function' ? c[k](row, i) : c[k];
        });
        return cell;
      }));

    const tdEnter = tdUpdate.enter().append('td');

    tdEnter
      .attr('class', d => d.cl)
      .style('background-color', '#fff')
      .style('border-bottom', '.5px solid white');

    tdEnter.html(d => d.html);
  }
}

function mouseenter() {
  d3.select(this).selectAll('td')
    .style('background-color', '#f0f0f0')
    .style('border-bottom', '.5px solid slategrey');
}

function mouseleave() {
  d3.select(this).selectAll('td')
    .style('background-color', '#fff')
    .style('border-bottom', '.5px solid white');
}
