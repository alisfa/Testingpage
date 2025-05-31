document.getElementById("startAR").addEventListener("click", () => {
  document.getElementById("startAR").style.display = "none";

  const query = new URLSearchParams(window.location.search);
  const base64 = query.get("data");

  if (!base64) {
    alert("Missing ?data=base64-url parameter");
    throw new Error("No base64 string found");
  }

  const decodedUrl = atob(base64);
  console.log("Decoded URL:", decodedUrl);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 1.6, 3);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);
  document.body.appendChild(VRButton.createButton(renderer));

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

  let mixer;

  const loader = new THREE.GLTFLoader();
  loader.load(decodedUrl, (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, -1);
    scene.add(model);

    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }
  }, undefined, (error) => {
    console.error("GLB load error:", error);
  });

  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
