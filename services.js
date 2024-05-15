"use strict";

var imageModelURLs = [
  'https://teachablemachine.withgoogle.com/models/6IhU7aB45/',
  'https://teachablemachine.withgoogle.com/models/-evzaGiE7/',
  // Add more model URLs if needed
];

var classifiers = []; // Array to hold multiple classifiers
var cam;
var labels = [];
var confidences = [];

function preload() {
  // Load multiple models
  for (let i = 0; i < imageModelURLs.length; i++) {
    classifiers.push(ml5.imageClassifier(imageModelURLs[i] + 'model.json'));
  }
}

function setup() {
  var viewport = createCanvas(640, 480);
  viewport.parent('video_container');
  frameRate(24);

  cam = createCapture(VIDEO);
  cam.hide();

  for (let i = 0; i < classifiers.length; i++) {
    labels.push("");
    confidences.push(0);
    
    // Create container for label and progress bar
    let resultContainer = createElement('div', '');
    resultContainer.id(`result-container-${i}`);
    resultContainer.class('result-container');
    select('#results').child(resultContainer);

    // Create label element
    let labelElement = createElement('div', `Model ${i + 1}: `);
    labelElement.id(`label-${i}`);
    labelElement.class('label');
    resultContainer.child(labelElement);

    // Create progress bar container
    let progressBarContainer = createElement('div', '');
    progressBarContainer.class('progress-bar-container');
    resultContainer.child(progressBarContainer);

    // Create progress bar elements
    let progressBar = createElement('div', '');
    progressBar.id(`progress-bar-${i}`);
    progressBar.class('progress-bar');
    progressBarContainer.child(progressBar);
  }

  classify();
}

function classify() {
  for (let i = 0; i < classifiers.length; i++) {
    classifyWithIndex(i);
  }
}

function classifyWithIndex(index) {
  classifiers[index].classify(cam, (error, results) => {
    if (error) {
      console.error("classifier error: " + error);
    } else {
      labels[index] = results[0].label;
      confidences[index] = results[0].confidence;
      redraw(); // Redraw canvas upon classification
      // Re-run classification
      classifyWithIndex(index);
    }
  });
}

function draw() {
  background("#c0c0c0");
  displayResults();
  image(cam, 0, 0); // Draw video after labels
}

function displayResults() {
  for (let i = 0; i < labels.length; i++) {
    let label = labels[i];
    let confidence = (confidences[i] * 100).toFixed(0);

    // Update label text
    select(`#label-${i}`).html(`Model ${i + 1}: ${label}`);
    
    // Update progress bar
    let progressBar = select(`#progress-bar-${i}`);
    progressBar.style('width', `${confidence}%`);
    progressBar.html(`${confidence}%`);
  }
}
