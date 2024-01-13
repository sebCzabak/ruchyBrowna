let experimentResults = [];
let myChart;

const generateMonteCarloStep = () => {
  const angle = Math.random() * 2 * Math.PI;
  const stepLength = Math.sqrt(-2 * Math.log(Math.random()));

  const deltaX = stepLength * Math.cos(angle);
  const deltaY = stepLength * Math.sin(angle);

  return [deltaX, deltaY];
};

const calculateDisplacement = (steps) => {
  let x = 0;
  let y = 0;

  for (let i = 0; i < steps.length; i++) {
    x += steps[i][0];
    y += steps[i][1];
  }

  return Math.sqrt(x ** 2 + y ** 2);
};

const generateTrajectory = (n) => {
  const trajectory = [];
  let x = 0;
  let y = 0;

  for (let i = 0; i < n; i++) {
    const [deltaX, deltaY] = generateMonteCarloStep();
    x += deltaX;
    y += deltaY;
    trajectory.push([x, y]);
  }

  return trajectory;
};

const createChart = (data) => {
  const ctx = document.getElementById("myChart").getContext("2d");

  if (myChart) {
    myChart.destroy();
  }

  const labels = data.map((_, index) => index + 1);
  const displacements = data.map((item) => item[3]);

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Przesunięcie",
          data: displacements,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          fill: false,
        },
      ],
    },
  });

  const downloadLink = document.getElementById("downloadLink");
  if (downloadLink) {
    downloadLink.href = generateResultsFile(data);
    downloadLink.style.display = "block";
  }
};

const generateResultsFile = (data) => {
  const content = data
    .map((item) => `${item[0]}\t${item[1]}\t${item[2]}\t${item[3]}`)
    .join("\n");
  const blob = new Blob([content], { type: "text/plain" });

  return URL.createObjectURL(blob);
};

const returnToChart = () => {
  const downloadSection = document.getElementById("downloadSection");
  if (downloadSection) {
    downloadSection.style.display = "none";
  }
  return false;
};

const runExperiment = () => {
  const numSteps = parseInt(document.getElementById("numSteps").value, 10);
  const results = [];

  for (let i = 0; i < numSteps; i++) {
    const steps = generateTrajectory(numSteps);
    const displacement = calculateDisplacement(steps);
    results.push([
      numSteps,
      steps[numSteps - 1][0],
      steps[numSteps - 1][1],
      displacement,
    ]);
  }

  experimentResults = results;
  createChart(experimentResults);
};

const showResult = () => {
  if (experimentResults.length > 0) {
    createChart(experimentResults);
    console.log(experimentResults);
  }
};

const saveResults = () => {
  const dataToSave = experimentResults
    .map((item) => item.join("\t"))
    .join("\n");
  const blob = new Blob([dataToSave], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "experiment_results.txt";
  link.click();
};
const loadFile = () => {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      processData(content);
      createChart(experimentResults);
    };
    reader.readAsText(file);
  }
};
const processData = (content) => {
  experimentResults = content
    .split("\n")
    .map((line) => line.split("\t").map(parseFloat))
    .filter((data) => data.length === 4);
};
const showResults = () => {
  const resultSection = document.getElementById("showResultsButton");
  resultSection.style.display = "block";

  const meanPosition = document.getElementById("meanPosition");
  const meanX =
    experimentResults.reduce((sum, data) => sum + data[1], 0) /
    experimentResults.length;
  const meanY =
    experimentResults.reduce((sum, data) => sum + data[2], 0) /
    experimentResults.length;

  meanPosition.textContent = `Średnie położenie: 
  X=${meanX.toFixed(4)}, Y=${meanY.toFixed(4)}`;

  const meanDisplacement = calculateAverageDisplacement(experimentResults);
  const meanDisplacementText = `Średnia długość przesunięcia:
   ${meanDisplacement.toFixed(4)}`;

  const meanDisplacementElement = document.getElementById("meanDisplacement");
  if (meanDisplacementElement) {
    meanDisplacementElement.textContent = meanDisplacementText;
  } else {
    const newMeanDisplacementElement = document.createElement("p");
    newMeanDisplacementElement.id = "meanDisplacement";
    newMeanDisplacementElement.textContent = meanDisplacementText;
    document.body.appendChild(newMeanDisplacementElement);
  }
};
const calculateAverageDisplacement = (data) => {
  const totalDisplacement = data.reduce((sum, item) => {
    const deltaX = item[1];
    const deltaY = item[2];
    const displacement = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    return sum + displacement;
  }, 0);

  const averageDisplacement = totalDisplacement / data.length;
  return averageDisplacement;
};
