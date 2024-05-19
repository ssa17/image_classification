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
    imgElement.style.maxWidth = "100px"; // Adjust size for table preview
    imgElement.style.maxHeight = "100px";

    runImageModels(imgElement);
  };
  reader.readAsDataURL(file);
}

function runImageModels(imgElement) {
  const resultsTableBody = document.querySelector('#resultsTable tbody');
  resultsTableBody.innerHTML = ''; // Clear previous results

  const promises = imageModelURLs.map(url => ml5.imageClassifier(url));

  Promise.all(promises).then(classifiers => {
    let descriptions = [];

    classifiers.forEach((classifier, index) => {
      classifier.classify(imgElement, (error, results) => {
        if (error) {
          console.error('Error classifying image:', error);
          return;
        }
        const { label, confidence } = results[0];
        const confidencePercentage = (confidence * 100).toFixed(2);
        let description;

        if (index === 1) { // Special case for Model 2: Glasses detection
          description = `is ${label.includes('glasses') ? 'wearing glasses' : 'not wearing glasses'} (${confidencePercentage}%)`;
        } else {
          if (confidence >= 0.8) {
            description = `is ${label} (${confidencePercentage}%)`;
          } else if (confidence >= 0.6) {
            description = `is likely ${label} (${confidencePercentage}%)`;
          } else {
            description = `could be ${label} (${confidencePercentage}%)`;
          }
        }

        descriptions.push(description);

        if (descriptions.length === classifiers.length) {
          const row = resultsTableBody.insertRow();
          const imageCell = row.insertCell(0);
          imageCell.appendChild(imgElement.cloneNode(true));
          const descriptionCell = row.insertCell(1);
          descriptionCell.innerHTML = descriptions.join('<br>'); // Use <br> for new lines
        }
      });
    });
  }).catch(error => {
    console.error('Error loading classifiers:', error);
  });
}
