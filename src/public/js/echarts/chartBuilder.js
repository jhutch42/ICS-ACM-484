export class ChartBuilder {
    #chartStagingArea;

    constructor(publisher, subscriber) {
        this.#chartStagingArea = new Map();
        this.publisher = publisher;
        this.subscriber = subscriber;
        this.subscriber.setCallbackFunction(this.messageHandler);
        this.messageHandler.bind(this);
    };

    drawEChart(data, type, div, theme) {

        const myChart = echarts.init(div, theme);
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

    messageHandler(message) {
        console.log(this);
        switch (message.from) {
            case 'dataManager':
                if (message.body) this.#handleDataManagerMessage(message.body);
                break;
        }
    }

    #handleDataManagerMessage(messsageBody) {
        console.log('test');
        if (messageBody.message) {
            switch (messsageBody.message) {
                case 'Player Ranking Histogram Data':
                    this.#createPlayerRankingHistogram(messageBody.data);
                    break;
            }
        }
    }

    #createPlayerRankingHistogram(data) {
        this.#chartStagingArea.set('uniquePlayersDiv', {
            divKey: 'uniquePlayersDiv',
            data: data,
            divElement: undefined,
            chartType: 'bar',
            theme: 'dark'
        });
        this.publisher.publishMessage(
            {
                from: 'chartBuilder',
                body: {
                    message: 'Dom Element Request',
                    divKey: 'uniquePlayersDiv',
                    callbackFunction: this.processDivReturn
                }
            }
        );
    }

    processDivReturn(divElement, divKey) {
        if (this.#chartStagingArea.has(divKey)) {
            chartData = this.#chartStagingArea.get(divKey);
            this.drawEChart(chartData.data, chartData.chartType, divElement, chartData.theme);
            this.#chartStagingArea.delete(divKey);
        }
    }
}