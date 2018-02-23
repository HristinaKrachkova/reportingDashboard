(function() {
    const svg = d3.select('#dashboard3').append('svg')
        .attr("width", 1000)
        .attr("height", 600);

    const margin = {
            top: 20,
            right: 20,
            bottom: 80,
            left: 40
        },
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom,
        g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


    const xScale = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.10);

    const yScale = d3.scaleLinear()
        .rangeRound([height, 0]);

    const color = d3.scaleOrdinal()
        .range(['#0288D1', '#BF360C']);

    d3.csv('3_killedByAgeAndGender.csv', function(d, i, col) {
        for (i = 1, t = 0; i < col.length; ++i)
            t += d[col[i]] = +d[col[i]];
        d.total = t;
        return d;
    }, function(error, data) {
        if (error) throw error;
        const susStack_keys = data.columns.slice(1);

        xScale.domain(data.map(function(d) {
            return d.Year;
        }));
        yScale.domain([0, d3.max(data, function(d) {
            return d.total;
        })]).nice();
        color.domain(susStack_keys);

        g.append('g')
            .selectAll('g')
            .data(d3.stack().keys(susStack_keys)(data))
            .enter().append('g')
            .attr('fill', function(d) {
                return color(d.key);
            })
            .attr('stroke-width', 2)
            .selectAll('rect')
            .data(function(d) {
                return d;
            })
            .enter().append('rect')
            .attr('x', function(d) {
                return xScale(d.data.Year);
            })
            .attr('y', function(d) {
                return yScale(d[1]);
            })
            .attr('height', function(d) {
                return yScale(d[0]) - yScale(d[1]);
            })
            .attr('width', xScale.bandwidth())
            .on('mouseover', function() {
                bar.style('display', null);
            })
            .on('mouseout', function() {
                bar.style('display', 'none');
            })
            .on('mousemove', function(d) {
                const mouseX = d3.mouse(this)[0] - 5;
                const mouseY = d3.mouse(this)[1] - 5;
                bar.attr('transform', 'translate(' + mouseX + ',' + mouseY + ')');
                bar.select('text').text(d[1] - d[0]);
            });

        g.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(xScale));

        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(yScale).ticks(null, 's'))
            .append('text')
            .attr('x', 2)
            .attr('y', 2)
            .attr('dy', '0.32em')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'start');

        const legend = g.append('g')
            .attr('font-family', 'sans-serif')
            .attr('text-anchor', 'end')
            .selectAll('g')
            .data(susStack_keys.slice().reverse())
            .enter().append('g')
            .attr('transform', function(d, i) {
                return 'translate(' + i + 30 + ', 5 )';
            });

        legend.append('rect')
            .attr('x', width / 2.5)
            .attr('y', height + 35)
            .attr('width', 20)
            .attr('height', 20)
            .style('fill', color);

        legend.append('text')
            .attr('x', width / 2.5 + 10)
            .attr('y', height + 65)
            .attr('text-anchor', 'middle')
            .style('fill', '#fff')
            .attr('dy', '0.5rem')
            .text(function(d) {
                return d;
            });
    });

    const bar = svg.append('g')
        .attr('class', 'bar')
        .style('display', 'none');

    bar.append('text')
        .attr('x', 30)
        .attr('dy', '1.2em')
        .style('text-anchor', 'middle')
        .style('font-size', '1.5em')
        .attr('font-weight', 'bold')
        .attr('pointer-events', 'none');
})();