async function loadComponent(file) {
  const res = await fetch(file);
  return await res.text();
}