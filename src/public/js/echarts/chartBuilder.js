export class ChartBuilder {
    constructor() { };

    drawEChart(data, type, pdiv, theme) {

        const myChart = echarts.init(pdiv, theme);
        const option = {
            xAxis: {
                type: 'value',
                data: data.data.x
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: data.data.y,
                    type: type
                }
            ]
        };

        option && myChart.setOption(option);
        return myChart;
    };

}