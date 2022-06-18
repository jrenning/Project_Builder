
import {initializeSettings} from "./settings.js"
import {PageTransitions} from './transitions.js'
import {initializeProjectForm} from "./projects.js"
import { initializeHides, initializeVSCode } from "./helpers.js";

initializeSettings();

PageTransitions();

initializeProjectForm();

initializeVSCode();

initializeHides();

