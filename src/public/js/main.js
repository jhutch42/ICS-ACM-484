import InstanceFactory from "./instanceFactory/instanceFactory.js";

const FACTORY = new InstanceFactory(); // Use this to create objects from the classes.
const DATAMANAGER = FACTORY.createDataManager(); // Create Singleton DataManager object.
