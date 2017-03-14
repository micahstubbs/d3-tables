      var table = d3.select(".table-container").append("table");
      table.append("thead");
      table.append("tbody");

      queue()
        .defer(d3.json, "qcew.json")
        .defer(d3.json, "stateface.json")
        .await(ready);

      function ready(error, qcew, stateface) {
        if (error) throw error;

        var columns = [
          {
            head: "State",
            cl: "state",
            html: function(row) {
              var sf_letter = stateface[row.state_abbrev];
              var icon = '<span class="stateface">' + sf_letter + '</span>';
              var text = '<span class="title">' + row.state + '</span>';
              return icon + text;
            }
          },
          {
            head: "Employment (millions)",
            cl: "emp",
            html: function(row) {
              var scale = scale = d3.scale.threshold()
                .domain([1, 2, 4, 6])
                .range([1, 2, 3, 4, 5]);

              var icon = '<span class="fa fa-male"></span>';
              var value = d3.format(",.1f")(row.emp/1000000);
              var nIcons = scale(value);
              var text = '<span class="text">' + value + '</span>';
              return text + d3.range(nIcons)
                .map(function() { return icon; }).join("");
            }
          },
          {
            head: "Change in Employment",
            cl: "emp_pc",
            html: function(row) {
              var scale = d3.scale.threshold()
                .domain([0, .045])
                .range(["down", "right", "up"]);
              var icon = '<span class="fa fa-arrow-' + scale(row.emp_pc) +'"></span>';
              var value = d3.format(",.0%")(row.emp_pc);
              var text = '<span class="text">' + value + '</span>';
              return text + icon;
            }
          },
          {
            head: "Wage (weekly)",
            cl: "wage",
            html: function(row) {
              var scale = d3.scale.threshold()
                .domain([850, 1000])
                .range([1, 2, 3]);

              var icon = '<span class="fa fa-money fa-rotate-90"></span>';
              var nIcons = scale(row.wage);
              var value = d3.format("$,")(row.wage);
              var text = '<span class="text">' + value + '</span>';
              return text + d3.range(nIcons)
                .map(function() { return icon; }).join("");
            }
          },
          {
            head: "Change in Wage",
            cl: "wage_pc",
            html: function(row) {
              var scale = d3.scale.threshold()
                .domain([0, .07])
                .range(["down", "right", "up"]);

              var icon = '<span class="fa fa-arrow-' + scale(row.wage_pc) +'"></span>';
              var value = d3.format(",.0%")(row.wage_pc);
              var text = '<span class="text">' + value + '</span>';
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
              .attr("class", function(d) { return d.cl; })
              .text(function(d) { return d.head; })
              .on("click", function(d) {
                var ascending = d.ascending ? false : true;
                d.ascending = ascending;

                qcew.sort(function(a, b) {
                  return ascending ?
                    d3.ascending(a[d.cl], b[d.cl]) :
                    d3.descending(a[d.cl], b[d.cl]);
                });
                table.call(renderTable);
              });

          var tr = table.select("tbody").selectAll("tr").data(qcew);

          tr.enter().append("tr")
            .on("mouseenter", mouseenter)
            .on("mouseleave", mouseleave);

          var td = tr.selectAll("td")
              .data(function(row, i) {
                return columns.map(function(c) {
                  var cell = {};
                   d3.keys(c).forEach(function(k) {
                       cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
                   });
                   return cell;
                })
              })

          td.enter().append("td")
            .attr("class", function(d) { return d.cl; })
            .style("background-color", "#fff")
            .style("border-bottom", ".5px solid white");

          td.html(function(d) { return d.html; });
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