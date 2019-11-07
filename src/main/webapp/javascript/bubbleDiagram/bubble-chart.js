//TODO - Fix table, currently refs are broken
//TODO - Consider renaming this file
//TODO - Implement or delete zoom/reset buttons

//Occurence graph global API (used in individuals.jsp)
function setupOccurrenceGraph(individualID) { //TODO - look into individualID
    let focusedScale = 1.75;
    let occurrences = new OccurrenceGraph(individualID, focusedScale); //TODO - Remove mock
    occurrences.graphOccurenceData(false, ['a', 'b']); //TODO: Remove mock
}

//Sparse-tree mapping co-occurrence relationships between a focused individual and its species
class OccurrenceGraph extends ForceLayoutAbstract {
    constructor(individualId, focusedScale) {
	super(individualId, focusedScale);

	//TODO - Remove ref, use key
	this.sliders = {"temporal": {"ref": "temporal", "prev": 0},
			"spatial": {"ref":  "spatial", "prev": 0}};
	
	//TODO: Parse this data
	this.nodeData = [
	    {
		"id": 0,
		"group": 0,
		"data": {
		    "name": "Lion A",
		    "gender": "female",
		    "sightings": [
			{
			    "datetime_ms": 2000,
			    "location": {"lat": 1, "lon": 0}
			}
		    ],
		    "role": "alpha",
		    "isFocused": true
		}
	    },
	    {
		"id": 1,
		"group": 0,
		"data": {
		    "name": "Lion B",
		    "gender": "female",
		    "sightings": [
			{
			    "datetime_ms": 2200,
			    "location": {"lat": 2, "lon": 1}
			}
		    ]
		}
	    },
	    {
		"id": 2,
		"group": 1,
		"data": {
		    "name": "Lion C",
		    "gender": "male",
		    "sightings": [
			{
			    "datetime_ms": 1900,
			    "location": {"lat": 2, "lon": 0}
			}
		    ]
		}
	    },
	    {
		"id": 3,
		"group": 0,
		"data": {
		    "name": "Lion D",
		    "gender": "",
		    "sightings": [
			{
			    "datetime_ms": 2100,
			    "location": {"lat": 1, "lon": 1}
			}
		    ],
		}
	    },
	    {
		"id": 4,
		"group": 0,
		"data": {
		    "name": "Lion E",
		    "gender": "female",
		    "sightings": [
			{
			    "datetime_ms": 1600,
			    "location": {"lat": 0, "lon": 0}
			}
		    ],
		}
	    },
	    {
		"id": 5,
		"group": 2,
		"data": {
		    "name": "Lion F",
		    "gender": "male",
		    "sightings": [
			{
			    "datetime_ms": 2500,
			    "location": {"lat": -1, "lon": 0}
			}
		    ],
		}
	    }
	];

	this.linkData = [
	    {"linkId": 0, "source": 0, "target": 1, "type": "maternal", "group": 0},
	    {"linkId": 1, "source": 0, "target": 2, "type": "member", "group": -1},
	    {"linkId": 2, "source": 0, "target": 3, "type": "maternal", "group": 0},
	    {"linkId": 3, "source": 0, "target": 4, "type": "maternal", "group": 0},
	    {"linkId": 4, "source": 0, "target": 5, "type": "member", "group": -1}
	];	
    }

    //Generate a co-occurrence graph
    graphOccurenceData(error, json) {
	if (error) {
	    return console.error(json);
	}
	else if (json.length >= 1) { //if (json.length >= 1) { //TODO
	    this.appendSvg("#bubbleChart");
	    this.addTooltip("#bubbleChart");

	    this.getRangeSliderAttr();
	    this.updateRangeSliders();
	    
	    this.calcNodeSize(this.nodeData);
	    this.setNodeRadius();
	    
	    this.setupGraph();
	    this.updateGraph();
	}
	else this.showTable("cooccurrenceTable", ""); //TODO - Fix
    }

    //Calculate the maximum and average node differences for the spatial/temporal sliders
    getRangeSliderAttr() {
	let distArr = [], timeArr = []
	let focusedNode = this.nodeData.find(d => d.data.isFocused);
	this.nodeData.forEach(d => {
	    if (d.id !== focusedNode.id) {
		let dist = this.getMin(focusedNode, d, "spatial");
		let time = this.getMin(focusedNode, d, "temporal");
		distArr.push(dist)
		timeArr.push(time);
	    }
	});

	console.log("DIST", distArr); //TODO - delete
	console.log("TIME", timeArr); //TODO - delete

	this.sliders.temporal.max = Math.max(...timeArr);
	this.sliders.temporal.mean = timeArr.reduce((a,b) => a + b, 0) / timeArr.length;

	this.sliders.spatial.max = Math.max(...distArr);
	this.sliders.spatial.mean = distArr.reduce((a,b) => a + b, 0) / distArr.length;
    }

    //Wrapper for finding the minimum spatial/temporal differences between two nodes
    getMin(node1, node2, type) {
	let node1Sightings = node1.data.sightings;
	let node2Sightings = node2.data.sightings;
	return this.getMinBruteForce(node1Sightings, node2Sightings, type);
    }

    //TODO - Consider strip optimizations
    //Find the minimum spatial/temporal difference between two node sightings
    getMinBruteForce(node1Sightings, node2Sightings, type) {
	let val;
	let min = Number.MAX_VALUE;
	node1Sightings.forEach(node1 => {
	    node2Sightings.forEach(node2 => {
		if (type === "spatial") 
		    val = this.calculateDist(node1.location, node2.location);
		else if (type === "temporal")
		    val = this.calculateTime(node1.datetime_ms, node2.datetime_ms)

		if (val < min) min = val;
	    });
	});
	return min;
    }

    //Calculate the spatial difference between two node sighting locations
    calculateDist(node1Loc, node2Loc) {
	return Math.pow(Math.pow(node1Loc.lon - node2Loc.lon, 2) -
			Math.pow(node1Loc.lat - node2Loc.lat, 2), 0.5);
    }

    //Calculate the temporal difference between two node sightings
    calculateTime(node1Time, node2Time) {
	return Math.abs(node1Time - node2Time)
    }

    //Update known range sliders (this.sliders) with contextual ranges/values
    updateRangeSliders() {
	Object.values(this.sliders).forEach(slider => {
	    console.log("MAX", slider.max) //TODO - Delete
	    let sliderNode = $("#" + slider.ref);
	    sliderNode.attr("max", slider.max);
	    sliderNode.attr("value", slider.max);
	    sliderNode.change(() =>
			      this.filterByOccurrence(this, sliderNode.val(), slider.ref));
	});
    }

    //Filter nodes by spatial/temporal differences, displaying those less than the set threshold 
    filterByOccurrence(self, threshold, occType) {
	let focusedNode = self.nodeData.find(d => d.data.isFocused);
	console.log(threshold); //TODO - Delete
	
	let nodeFilter = (d) => (self.getMin(focusedNode, d, occType) <= threshold)
	let linkFilter = (d) => (self.getMin(focusedNode, d.source, occType) <= threshold) &&
	    (self.getMin(focusedNode, d.target, occType) <= threshold)
	let filterType = (threshold >= self.sliders[occType].prev) ? "restore" : "remove";
	self.sliders[occType].prev = threshold;
	
	self.absoluteFilterGraph(nodeFilter, linkFilter, filterType);
    }
}
