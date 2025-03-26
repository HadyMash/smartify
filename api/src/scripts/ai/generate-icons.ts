/* Downloads images of the rounded flutter material icons */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function start() {
  // Launch the browser
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Go to the Flutter Icons page
    await page.goto(
      'https://api.flutter.dev/flutter/material/Icons-class.html',
    );

    // Create the icons directory if it doesn't exist
    const iconsDir = path.join('src', 'scripts', 'ai', 'icons');

    console.log('icons dir:', iconsDir);

    console.log('icons dir exists:', fs.existsSync(iconsDir));

    if (!fs.existsSync(iconsDir)) {
      console.log('Creating icons directory');
      fs.mkdirSync(iconsDir);
    }

    // Evaluate JavaScript within the page
    await page
      .evaluate(async () => {
        // Helper function to delay execution
        /**
         * @param time - The time in milliseconds to delay
         * @returns
         */
        function delay(time: number) {
          return new Promise(function (resolve) {
            setTimeout(resolve, time);
          });
        }

        // Get the parent element containing the icons
        const iconsContainer = document.querySelector('#constants > dl');

        if (!iconsContainer) {
          console.error('Icons container not found');
          process.exit(1);
        }

        const iconSet = new Set();

        // Get all dt and dd elements
        const dtElements = iconsContainer.querySelectorAll('dt');
        const ddElements = iconsContainer.querySelectorAll('dd');
        const iconDataArray = [];

        // Loop through the dt and dd elements
        for (let i = 0; i < dtElements.length; i++) {
          console.log('i:', i);
          const dt = dtElements[i];
          const dd = ddElements[i];

          // check if a variation was done before
          // if so, skip the icon
          const iconIdentifier = dd.querySelector('i')?.textContent;
          console.log('iconIdentifier:', iconIdentifier);

          if (iconIdentifier && iconSet.has(iconIdentifier)) {
            continue;
          }

          iconSet.add(iconIdentifier);

          // Get the icon name from the dt's id
          const iconName = dt.id;

          console.log(`Processing icon: ${iconName}`);

          // Get the i element containing the icon
          const iconElement = dd.querySelector('i');

          if (!iconElement) {
            console.error(`Icon element not found for icon: ${iconName}`);
            continue;
          }

          // Create a canvas and render the icon on it
          const canvas = document.createElement('canvas');
          canvas.width = 500;
          canvas.height = 500;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            console.error('Canvas context not found');
            continue;
          }

          // Set the font size and family to match the material icons
          ctx.font = '400px Material Icons';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (!iconElement.textContent) {
            console.error(`Icon content not found for icon: ${iconName}`);
            continue;
          }

          // Set white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Set color for the icon
          ctx.fillStyle = 'black';

          // Draw the icon on the canvas
          ctx.fillText(
            iconElement.textContent,
            canvas.width / 2,
            canvas.height / 2,
          );

          // Convert the canvas to a data URL
          const dataURL = canvas.toDataURL('image/png');

          // Download the image
          const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');

          // Delay to avoid overwhelming the server
          await delay(10);

          // Add the icon data to the array
          iconDataArray.push({ iconName: iconName, base64Data: base64Data });
        }
        return iconDataArray;
      })
      .then(async (iconDataArray) => {
        // write them in parallel
        const promises = iconDataArray.map((iconData) => {
          if (!iconData) {
            return;
          }
          return fs.promises
            .writeFile(
              path.join(iconsDir, `${iconData.iconName}.png`),
              iconData.base64Data,
              'base64',
            )
            .then(() => console.log(`Downloaded icon: ${iconData.iconName}`));
        });

        await Promise.all(promises);
      });
  } finally {
    // Close the browser
    await browser.close();
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
start();
