const BASE_URL = "/api/v1/";

/**
 * send requests to backend with exponencial backoff
 * @param {string} api
 * @param {RequestInit} params
 */
async function sendRequest(path, params, retries = 5, sleep = 250) {
  const response = await fetch(`${BASE_URL}${path}`, params);
  if (response.status >= 200 && response.status < 300) {
    return response.json();
  } else if (response.status === 400) {
    // If the response status is 400, throw an error with the error message from the server
    let json;
    try {
      json = await response.json();
    } catch (err) {
      throw new Error(`Request failed with status ${response.status}`, err);
    }
    throw new Error(json.error);
  } else if (retries > 0) {
    // Retry after sleep
    await new Promise((resolve) => setTimeout(resolve, sleep));
    sleep *= 2;
    return sendRequest(path, params, retries - 1, sleep);
  } else {
    throw new Error(`Request failed with status ${response.status}`);
  }
}

async function updateImages() {
  // get the image grid div
  const grid = document.getElementById("image-grid");
  const query = document.getElementById("search-input").value;

  const fetchedImages = await sendRequest(
    `images?query=${encodeURIComponent(query)}`,
  );

  // Clear the grid
  grid.innerHTML = "";

  // Add images to the grid
  for (const imageGroup of fetchedImages) {
    const imageRow = document.createElement("div");
    imageRow.classList.add("image-row");

    for (const image of imageGroup) {
      const imageElement = document.createElement("img");
      imageElement.src = image.imageUrl;
      imageElement.alt = `Image ${image.id}`;

      // Make the image smaller for thumbnail in 16:9 ratio
      imageElement.width = 160;
      imageElement.height = 90;

      imageElement.classList.add("image");
      imageRow.appendChild(imageElement);
    }

    grid.appendChild(imageRow);
  }
}

async function main() {
  // Listen for search button click and update images
  document.getElementById("search-button").onclick = updateImages;

  // get the submit button element
  const submitButton = document.getElementById("submit-button");

  // Listen for button clicks
  submitButton.onclick = async () => {
    // Get the uploaded files
    const imageUpload = document.getElementById("image-upload");

    /** @type {FileList} */
    const files = imageUpload.files;

    // Make sure the user uploaded something
    if (files.length == 0) {
      alert("Please upload at least one image.");
      return;
    }

    // Prepare formData for the server
    const formData = new FormData();
    for (let file of files) {
      formData.append("images", file);
    }

    // Upload the image to the server
    const response = await sendRequest("upload", {
      method: "POST",
      body: formData,
    }).catch((err) => {
      alert(`Failed to upload images: ${err.message}`);
    });

    // Handle the response
    if (response) {
      await updateImages();
      if (response.errors > 0) {
        alert(`Failed to upload ${response.errors} images.`);
      }
    }
  };

  await updateImages();
}

main();
