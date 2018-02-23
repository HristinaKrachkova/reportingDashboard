(function() {
    const data = [{
        category: 'DRIVERS',
        value: 506,
        color: '#AD1D0E',
        tx: 30,
        ty: 20
    }, {
        category: 'PASSENGERS',
        value: 222,
        color: '#AD5C0E',
        tx: -110,
        ty: 65
    }, {
        category: 'PEDESTRIANS',
        value: 193,
        color: '#0B8325',
        tx: -110,
        ty: -40
    }, {
        category: 'PEDALCYCLISTS',
        value: 31,
        color: '#0B5C6B',
        tx: -35,
        ty: -60
    }];


    const colorArray = data.map(k => k.color);
    const color = d3.scaleOrdinal()
        .range(colorArray);
    const viewWidth = 600,
        viewHeight = 300,
        thickness = 40;

    const svg = d3.select("#dashboard2")
        .append("svg")
        .attr("width", viewWidth)
        .attr("height", viewHeight)
        .append("g")
        .attr("transform", "translate(" + 150 + "," + 140 + ")");

    const pieGenerator = d3
        .pie()
        .value(function(d) {
            return d.value
        });


    const accent = d3.scaleOrdinal(d3.schemeCategory20c);

    const arcData = pieGenerator(data);

    const arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(140);

    const arcHover = d3.arc()
        .innerRadius(0)
        .outerRadius(140);

    svg.selectAll('path')
        .data(arcData)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('class', 'slice')
        .style('fill', function(d, i) {
            return color(d.data.category);
        })
        .on("mouseenter", handleMouseEnter)
        .on("mouseleave", handleMouseLeave);

    function handleMouseEnter(d, i) {
        d3.select(this)
            .transition()
            .duration(250)
            .attr('d', arcHover);

        svg.append('text')
            .attr('transform', function() {
                return 'translate(' + data[i].tx + ',' + data[i].ty + ')';
            })
            .style('fill', '#fff')
            .attr('font-size', '3em')
            .attr('class', 'label')
            .attr("pointer-events", "none")
            .text(d.data.value);
    };

    function handleMouseLeave(d, i) {
        d3.select(this)
            .transition()
            .duration(250)
            .attr('d', arcGenerator);

        svg.select('.label').remove();
    };

    const legendRectSize = 13;
    const legendSpacing = 21;
    const horz = 175;
    let vert = -40;
    const legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(legendData) {
            vert += legendSpacing * 1.15;
            return `translate(${horz}, ${vert})`;
        });

    legend.append('circle')
        .attr('r', legendRectSize / 1.8)
        .style('fill', color);


    legend.append('text')
        .data(data)
        .attr('x', 22)
        .attr('y', 6)
        .attr('class', 'legend-text')
        .style('fill', '#fff')
        .attr('font-size', '1em')
        .text(function(d, i) { return data[i].category })
})();