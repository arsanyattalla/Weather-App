import * as tf from "@tensorflow/tfjs";

const suggestionMap = [
  "Wear light clothes",   // hot
  "Wear a jacket",        // moderate
  "Wear a heavy coat",    // cold
];

let model;


const data = [];
for (let t = 30; t <= 90; t += 1) {
  let label = t >= 75 ? 0 : t >= 55 ? 1 : 2;
  data.push({ temp: t, suggestion: label });
}

export async function trainModel() {
  const xs = tf.tensor2d(data.map(d => [d.temp]), [data.length, 1], "float32");
  const ys = tf.tensor1d(data.map(d => d.suggestion), "float32"); 

  model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [1], units: 10, activation: "relu" }));
  model.add(tf.layers.dense({ units: 3, activation: "softmax" }));

  model.compile({
    optimizer: "adam",
    loss: "sparseCategoricalCrossentropy",
    metrics: ["accuracy"],
  });

  await model.fit(xs, ys, { epochs: 300 });
  console.log("AI model trained successfully");

  xs.dispose();
  ys.dispose();
}

export function getSuggestion(temp) {
  if (!model) return "AI model not trained yet";

  const input = tf.tensor2d([[temp]], [1, 1], "float32");
  const prediction = model.predict(input);
  const predictedIndex = tf.tidy(() => prediction.argMax(-1).dataSync()[0]);
  input.dispose();
console.log(model.layers[0].getWeights()); 
console.log(model.layers[1].getWeights());
  return suggestionMap[predictedIndex];
}
