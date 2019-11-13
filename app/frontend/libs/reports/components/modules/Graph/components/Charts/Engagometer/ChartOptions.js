export default function ChartOptions () {
  return {
    pane: {
      startAngle: -150,
      endAngle: 150,
      background: [{
        backgroundColor: {
          linearGradient: {
            x1: 0, y1: 0, x2: 0, y2: 1,
          },
          stops: [
            [0, '#FFF'],
            [1, '#333'],
          ],
        },
        borderWidth: 0,
        outerRadius: '109%',
      }, {
        backgroundColor: {
          linearGradient: {
            x1: 0, y1: 0, x2: 0, y2: 1,
          },
          stops: [
            [0, '#333'],
            [1, '#FFF'],
          ],
        },
        borderWidth: 1,
        outerRadius: '107%',
      }, {
        // default background
      }, {
        backgroundColor: '#DDD',
        borderWidth: 0,
        outerRadius: '105%',
        innerRadius: '103%',
      }],
    },
    chart: {
      type: 'gauge',
      plotBackgroundColor: null,
      plotBackgroundImage: null,
      plotBorderWidth: 0,
      plotShadow: false,
    },
    credits: {
      enabled: false,
    },
    title: false,

    legend: {
      labelFormatter () {
        return `<span style="color:${this.color}">${this.name}</span>`
      },
      symbolWidth: 0,
    },
  }
}
