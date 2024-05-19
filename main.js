"use strict";

var imageModelURLs = [
  'https://teachablemachine.withgoogle.com/models/6IhU7aB45/model.json',
  'https://teachablemachine.withgoogle.com/models/-evzaGiE7/model.json',
  'https://teachablemachine.withgoogle.com/models/0nSCSlslv/model.json'
];

document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const imgElement = document.createElement('img');
    imgElement.src = e.target.result;
    imgElement.id = "uploadedImage";
    imgElement.style.maxWidth = "500px";
    imgElement.style.maxHeight = "500px";

    const previewContainer = document.getElementById('preview');
    previewContainer.innerHTML = ''; // Clear previous images
    previewContainer.appendChild(imgElement);

    runImageModels(imgElement);
  };
  reader.readAsDataURL(file);
}

function runImageModels(imgElement) {
  const resultsTableBody = document.querySelector('#resultsTable tbody');
  resultsTableBody.innerHTML = ''; // Clear previous results

  const classifiers = [];
  const promises = imageModelURLs.map(url => ml5.imageClassifier(url));

  Promise.all(promises).then(classifiers => {
    classifiers.forEach((classifier, index) => {
      classifier.classify(imgElement, (error, results) => {
        if (error) {
          console.error('Error classifying image:', error);
          return;
        }
        const { label, confidence } = results[0];
        const confidencePercentage = (confidence * 100).toFixed(2);

        const row = resultsTableBody.insertRow();
        row.insertCell(0).textContent = `Model ${index + 1}`;
        row.insertCell(1).textContent = label;
        row.insertCell(2).textContent = `${confidencePercentage}%`;
      });
    });
  }).catch(error => {
    console.error('Error loading classifiers:', error);
  });
}
