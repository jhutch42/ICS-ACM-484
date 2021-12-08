import * as echarts from 'echarts';

import blackcapfreq from server.js;
import whitecapfreq

var chartDom = document.getElementById('main');
var myChart = echarts.init(chartDom, 'dark');
var option;


const num = ['1', '2', '3', '4', '5', '6', '7', '8'];

const letter = ['A', 'B', 'C','D', 'E', 'F', 'G', 'H'];

option = {
  tooltip: {
    position: 'top'
  },
  grid: {
    height: '50%',
    top: '10%'
  },
  xAxis: {
    type: 'category',
    data: letter,
    splitArea: {
      show: true
    }
  },
  yAxis: {
    type: 'category',
    data: num,
    splitArea: {
      show: true
    }
  },
  visualMap: {
    min: 0,
    max: 10,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '15%'
  },
  series: [
    {
      name: 'Punch Card',
      type: 'heatmap',
      data: whitecapfreq,
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
};

option && myChart.setOption(option);
