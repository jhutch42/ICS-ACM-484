import InstanceFactory from "./instanceFactory/instanceFactory.js";

const FACTORY = new InstanceFactory(); // Use this to create objects from the classes.
const DATAMANAGER = FACTORY.createDataManager(); // Create Singleton DataManager object.
const CHARTBUILDER = FACTORY.createChartBuilder(); // Create Singleton Chartbuilder object
const DOMMANAGER = FACTORY.createDomManager(); // Create a Singleton Dom Manager Object

DATAMANAGER.publisher.subscribe(DOMMANAGER.messageHandler.bind(DOMMANAGER));
CHARTBUILDER.publisher.subscribe(DOMMANAGER.messageHandler.bind(DOMMANAGER));
DATAMANAGER.publisher.subscribe(CHARTBUILDER.messageHandler.bind(CHARTBUILDER));
DOMMANAGER.publisher.subscribe(CHARTBUILDER.messageHandler.bind(CHARTBUILDER));

DATAMANAGER.checkDataAvailability();

//CHARTBUILDER.drawEChart(DATAMANAGER.getRankingHistogramData(100));

// document.addEventListener('keyup', (e) => {
//     console.log('key');
//     if (e.code === 'KeyF')  DATAMANAGER.createPlayerRankMapping();
//   });