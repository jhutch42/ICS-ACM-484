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
                case 'Odds Of Favorite Winning Pie Chart':
                    this.#createOddsOfFavoriteWinningPieChart(messageBody.data);
                    break;
                case 'Moves Per Game Histogram Data':
                    this.#createMovesPerGameHistogram(messageBody.data);
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

    #createMovesPerGameHistogram(data) {
        this.chartStagingArea.set('movesPerGameDiv', {
            divKey: 'movesPerGameDiv',
            data: data,
            divElement: undefined
        });
        this.publisher.publishMessage(
            {
                from: 'chartBuilder',
                body: {
                    message: 'Dom Element Request',
                    divKey: 'movesPerGameDiv',
                    callbackFunction: this.processDivReturn.bind(this)
                }
            }
        );
    }

    #createOddsOfFavoriteWinningPieChart(data) {
        this.chartStagingArea.set('oddsOfFavoriteWinningDiv', {
            divKey: 'oddsOfFavoriteWinningDiv',
            data: data,
            divElement: undefined
        });
        this.publisher.publishMessage(
            {
                from: 'chartBuilder',
                body: {
                    message: 'Dom Element Request',
                    divKey: 'oddsOfFavoriteWinningDiv',
                    callbackFunction: this.processDivReturn.bind(this)
                }
            }
        );
    }

    processDivReturn(divElement, divKey) {
        if (this.chartStagingArea.has(divKey)) {
            const options = this.getOptions(this.chartStagingArea.get(divKey));
            console.log(options);
            this.chartStagingArea.delete(divKey);
            this.drawEChart(divElement, options, 'dark');
        }
    }

    getOptions(chartData) {
        switch (chartData.divKey) {
            case 'uniquePlayersChartDiv':
                return {
                    tooltip: {
                        trigger: 'item'
                    },
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
                }
            case 'oddsOfFavoriteWinningDiv':
                return {
                    tooltip: {
                        trigger: 'item'
                    },
                    legend: {
                        top: '5%',
                        left: 'center'
                    },
                    series: [
                        {
                            name: 'Odds Of Favorite Winning',
                            type: 'pie',
                            radius: ['40%', '70%'],
                            avoidLabelOverlap: false,
                            label: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    fontSize: '40',
                                    fontWeight: 'bold'
                                }
                            },
                            labelLine: {
                                show: false
                            },
                            data: chartData.data
                        }
                    ]
                }
            case 'movesPerGameDiv':
                return {
                    tooltip: {
                        trigger: 'item'
                    },
                    xAxis: {
                        type: 'category',
                        data: chartData.data.x,
                        name: 'Moves Per Game',
                        nameLocation: 'middle',
                        nameGap: 40
                    },
                    yAxis: {
                        type: 'value',
                        name: 'Number Of Games',
                        nameLocation: 'middle',
                        nameGap: 40
                    },
                    series: [
                        {
                            data: chartData.data.y,
                            type: 'bar'
                        }
                    ]
                }
        }
    }
}