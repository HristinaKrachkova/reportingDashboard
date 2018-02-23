(function() {
    const svg = d3.select('#dashboard4').append('svg')
        .attr("width", 1000)
        .attr("height", 600);

    const width = +svg.attr("width"),
        height = +svg.attr("height"),
        g = svg.append("g").attr("transform", "translate(130,0)");

    const cluster = d3.cluster()
        .size([height, width - 400]);

    const stratify = d3.stratify()
        .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

    d3.csv("4_geographicLocation.csv", function(error, data) {
        if (error) throw error;
        const root = stratify(data);

        cluster(root);

        const link = g.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);

        const node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

        node.append("circle")
            .attr("r", 4)
            .style('stroke', '999')
            .style('fill', '#fff');

        node.append("text")
            .attr("dy", function(d) { return d.children ? -3 : 3; })
            .attr("x", function(d) { return d.children ? -8 : 8; })
            .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .style('fill', '#fff')
            .style('stroke', '#999')
            .style('font-size', '1.2em')
            .text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });
    });

    function diagonal(d) {
        return "M" + d.y + "," + d.x +
            "C" + (d.parent.y + 100) + "," + d.x +
            " " + (d.parent.y + 100) + "," + d.parent.x +
            " " + d.parent.y + "," + d.parent.x;
    }
})();