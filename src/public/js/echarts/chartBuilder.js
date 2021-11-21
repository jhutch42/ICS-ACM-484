export class ChartBuilder {

    constructor(publisher, subscriber) {
        this.chartStagingArea = new Map();
        this.publisher = publisher;
        this.subscriber = subscriber;
    };

    drawEChart(div, options, theme) {
        const myChart = echarts.init(div, theme);
        options && myChart.setOption(options);
        return myChart;
    };

    messageHandler(message) {
        switch (message.from) {
            case 'dataManager':
                if (message.body) this.#handleDataManagerMessage(message.body);
                break;
        }
    }

    #handleDataManagerMessage(messageBody) {
        if (messageBody.message) {
            switch (messageBody.message) {
                case 'Player Ranking Histogram Data':
                    this.#createPlayerRankingHistogram(messageBody.data);
                    break;
            }
        }
    }

    #createPlayerRankingHistogram(data) {
        this.chartStagingArea.set('uniquePlayersChartDiv', {
            divKey: 'uniquePlayersChartDiv',
            data: data,
            divElement: undefined
        });
        this.publisher.publishMessage(
            {
                from: 'chartBuilder',
                body: {
                    message: 'Dom Element Request',
                    divKey: 'uniquePlayersChartDiv',
                    callbackFunction: this.processDivReturn.bind(this)
                }
            }
        );
    }

    processDivReturn(divElement, divKey) {
        if (this.chartStagingArea.has(divKey)) {
            const chartData = this.chartStagingArea.get(divKey);
            const options = {
                xAxis: {
                    type: 'category',
                    data: chartData.data.x,
                    name: 'Player Ranking',
                    nameLocation: 'middle',
                    nameGap: 40
                },
                yAxis: {
                    type: 'value',
                    name: 'Number Of Players',
                    nameLocation: 'middle',
                    nameGap: 40
                },
                series: [
                    {
                        data: chartData.data.y,
                        type: 'bar'
                    }
                ]
            };
            this.chartStagingArea.delete(divKey);
            this.drawEChart(divElement, options, 'dark');
        }
    }
}