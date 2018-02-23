function createChart(htmlElement, color, gradientID, jsonData, maxYScale, xHeightPosition) {


    d3.json(jsonData, function(data) {

        let minData = data.slice();
        minData = minData[0].values.reduce(function(prev, curr) {
            return prev.people < curr.people ? prev : curr;
        })

        const margin = {
            top: 20,
            bottom: 20,
            left: 50,
            right: 0
        };

        const width = 500 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;


        const createGradient = select => {
            const gradient = select
                .select('defs')
                .append('linearGradient')
                .attr('id', gradientID)
                .attr('x1', '0%')
                .attr('y1', '100%')
                .attr('x2', '0%')
                .attr('y2', '0%');

            gradient
                .append('stop')
                .attr('offset', '0%')
                .attr('style', `stop-color:${color};stop-opacity:0.05`);

            gradient
                .append('stop')
                .attr('offset', '100%')
                .attr('style', `stop-color:${color};stop-opacity:.5`);
        }

        const createGlowFilter = select => {
            const filter = select
                .select('defs')
                .append('filter')
                .attr('id', 'glow')

            filter
                .append('feGaussianBlur')
                .attr('stdDeviation', '4')
                .attr('result', 'coloredBlur');

            const femerge = filter
                .append('feMerge');

            femerge
                .append('feMergeNode')
                .attr('in', 'coloredBlur');
            femerge
                .append('feMergeNode')
                .attr('in', 'SourceGraphic');
        }

        const svg = d3.select(htmlElement)
            .append('svg')
            .attr('width', 500 + margin.left + margin.right)
            .attr('height', 300 + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        svg.append('defs');
        svg.call(createGradient);
        svg.call(createGlowFilter);

        const parseTime = d3.timeParse('%Y/%m/%d');

        const parsedData = data.map(data => ({
            values: data.values.map(val => ({
                people: val.people,
                date: parseTime(val.date)
            }))
        }));

        const ticks = parsedData[0].values.length;
        const xScale = d3.scaleTime()
            .domain([
                d3.min(parsedData, d => d3.min(d.values, v => v.date)),
                d3.max(parsedData, d => d3.max(d.values, v => v.date))
            ])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([
                d3.min(parsedData, d => d3.min(d.values, v => v.people - minData.people)),
                d3.max(parsedData, d => d3.max(d.values, v => v.people + maxYScale))
            ])
            .range([height, 0]);

        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.people));

        svg.selectAll('.line')
            .data(parsedData)
            .enter()
            .append('path')
            .attr('d', d => {
                const lineValues = line(d.values).slice(1);
                const splitedValues = lineValues.split(',');
                return `M0,${height},${lineValues},l0,${height - splitedValues[splitedValues.length - 1]}`
            })
            .style('fill', `url(#${gradientID})`)

        svg.selectAll('.line')
            .data(parsedData)
            .enter()
            .append('path')
            .attr('d', d => line(d.values))
            .attr('stroke-width', '1')
            .style('fill', 'none')
            .style('filter', 'url(#glow)')
            .attr('stroke', color);

        function setFade(selection, opacity) {
            selection.style('opacity', opacity);
        }

        const tick = svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(ticks))
            .selectAll('.tick')
            .style('transition', '.2s')

        tick
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-25)");

        tick
            .selectAll('line')
            .attr('stroke-dasharray', `5, 5`)
            .attr('stroke', '#fff')
            .attr('y2', -height)

        tick
            .append('rect')
            .attr('width', (width / 12) + 10)
            .attr('x', -width / 24 + 5)
            .attr('y', -height)
            .attr('height', height + 30)
            .style('cursor', 'pointer')
            .style('fill', 'transparent');

        svg.selectAll('.tick')
            .append('circle')
            .attr('r', '4px')
            .style('fill', color)
            .attr('cy', (x, i) => -height + yScale(parsedData[0].values[i].people));

        tick
            .on('mouseout', function(data, index, elements) {
                d3.selectAll(elements)
                    .call(setFade, 1);
                tick.select('.xText').remove();
            })
            .on('mouseover', function(data, index, elements) {
                const xHeight = parsedData[0].values[index].people;

                d3.selectAll(elements)
                    .filter(':not(:hover)')
                    .call(setFade, 0);
                d3.selectAll(elements)
                    .append('text')
                    .attr('class', 'xText')
                    .attr('transform', 'translate(5,' + -xHeight * 2 / xHeightPosition + ')')
                    .style('font-size', '1.5em')
                    .attr('text-anchor', 'start')
                    .text(parsedData[0].values[index].people)
                    .attr('pointer-events', 'none');
            })

        svg.append("g")
            .call(d3.axisLeft(yScale));

        svg.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle");

        svg.select('.domain')
            .attr('stroke', '#fff')
    })
}
createChart('#dashboard5', '#0288D1', 'gradient', '5_allCrashesByMonth.json', 2000, 100)
createChart('#dashboard6', '#BF360C', 'gradientRed', '6_fatalCrashesByMonth.json', 50, 1)