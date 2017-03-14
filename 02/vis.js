      const table = d3.select(".table-container").append("table");
      table.append("thead");
      table.append("tbody");

      queue()
        .defer(d3.json, "qcew.json")
        .defer(d3.json, "stateface.json")
        .await(ready);

      function ready(error, qcew, stateface) {
        if (error) throw error;

        const columns = [
          {
            head: "State",
            cl: "state",
            html(row) {
              const sf_letter = stateface[row.state_abbrev];
              const icon = `<span class="stateface">${sf_letter}</span>`;
              const text = `<span class="title">${row.state}</span>`;
              return icon + text;
            }
          },
          {
            head: "Employment (millions)",
            cl: "emp",
            html(row) {
              let scale = d3.scale.threshold()
                .domain([1, 2, 4, 6])
                .range([1, 2, 3, 4, 5]);

              const icon = '<span class="fa fa-male"></span>';
              const value = d3.format(",.1f")(row.emp/1000000);
              const nIcons = scale(value);
              const text = `<span class="text">${value}</span>`;
              return text + d3.range(nIcons)
                .map(() => icon).join("");
            }
          },
          {
            head: "Change in Employment",
            cl: "emp_pc",
            html(row) {
              const scale = d3.scale.threshold()
                .domain([0, .045])
                .range(["down", "right", "up"]);
              const icon = `<span class="fa fa-arrow-${scale(row.emp_pc)}"></span>`;
              const value = d3.format(",.0%")(row.emp_pc);
              const text = `<span class="text">${value}</span>`;
              return text + icon;
            }
          },
          {
            head: "Wage (weekly)",
            cl: "wage",
            html(row) {
              const scale = d3.scale.threshold()
                .domain([850, 1000])
                .range([1, 2, 3]);

              const icon = '<span class="fa fa-money fa-rotate-90"></span>';
              const nIcons = scale(row.wage);
              const value = d3.format("$,")(row.wage);
              const text = `<span class="text">${value}</span>`;
              return text + d3.range(nIcons)
                .map(() => icon).join("");
            }
          },
          {
            head: "Change in Wage",
            cl: "wage_pc",
            html(row) {
              const scale = d3.scale.threshold()
                .domain([0, .07])
                .range(["down", "right", "up"]);

              const icon = `<span class="fa fa-arrow-${scale(row.wage_pc)}"></span>`;
              const value = d3.format(",.0%")(row.wage_pc);
              const text = `<span class="text">${value}</span>`;
              return text + icon;
            }
          }
        ];

        table.call(renderTable);

        function renderTable(table) {

          table.select("thead")
            .selectAll("th")
              .data(columns)
            .enter().append("th")
              .attr("class", d => d.cl)
              .text(d => d.head)
              .on("click", d => {
                const ascending = d.ascending ? false : true;
                d.ascending = ascending;

                qcew.sort((a, b) => ascending ?
                  d3.ascending(a[d.cl], b[d.cl]) :
                  d3.descending(a[d.cl], b[d.cl]));
                table.call(renderTable);
              });

          const tr = table.select("tbody").selectAll("tr").data(qcew);

          tr.enter().append("tr")
            .on("mouseenter", mouseenter)
            .on("mouseleave", mouseleave);

          const td = tr.selectAll("td")
              .data((row, i) => columns.map(c => {
            const cell = {};
             d3.keys(c).forEach(k => {
                 cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
             });
             return cell;
          }));

          td.enter().append("td")
            .attr("class", d => d.cl)
            .style("background-color", "#fff")
            .style("border-bottom", ".5px solid white");

          td.html(d => d.html);
        }
      }

      function mouseenter() {
        d3.select(this).selectAll("td")
          .style("background-color", "#f0f0f0")
          .style("border-bottom", ".5px solid slategrey");
      }

      function mouseleave() {
        d3.select(this).selectAll("td")
          .style("background-color", "#fff")
          .style("border-bottom", ".5px solid white");
      }