import * as tf from "@tensorflow/tfjs";

const data = [
  { temp: 80, suggestion: 0 },
  { temp: 75, suggestion: 0 },
  { temp: 70, suggestion: 0 },
  { temp: 65, suggestion: 1 },
  { temp: 60, suggestion: 1 },
  { temp: 55, suggestion: 1 },
  { temp: 50, suggestion: 2 },
  { temp: 45, suggestion: 2 },
  { temp: 40, suggestion: 2 },
];
const suggestionMap = [
  "Wear light clothes",
  "Wear a jacket",
  "Wear a heavy coat",
];

let model;

export async function trainModel() {
  const xs = tf.tensor2d(data.map(d => [d.temp]));
  const ys = tf.tensor1d(data.map(d => d.suggestion)).toFloat(); // <-- FIX

  model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [1], units: 5, activation: "relu" }));
  model.add(tf.layers.dense({ units: 3, activation: "softmax" }));

  model.compile({
    optimizer: "adam",
    loss: "sparseCategoricalCrossentropy", // still works with float ys
    metrics: ["accuracy"],
  });

  await model.fit(xs, ys, { epochs: 200 });
}

export function getSuggestion(temp) {
  if (!model) return "AI model not trained yet";

  const input = tf.tensor2d([[temp]]);
  const prediction = model.predict(input);
  const predictedIndex = tf.tidy(() => prediction.argMax(-1).dataSync()[0]);
  input.dispose(); // dispose input tensor
  return suggestionMap[predictedIndex];
}