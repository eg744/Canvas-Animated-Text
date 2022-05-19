window.addEventListener('load', () => {
   const canvas = document.getElementById('animatedTextCanvas');
   const ctx = canvas.getContext('2d');
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;

   let particleArray = [];

   // ==Globals==
   let imageAdjustX = 5;
   let imageAdjustY = 5;
   let fillTextMessage = 'A';
   let intialHue = 1;
   let pixelColor = 'hsl(' + intialHue + ',50%,50%)';

   // ==Listeners==

   window.addEventListener('mousemove', (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
   });

   window.addEventListener('resize', debounce(updateCanvasSize));

   // Mouse coordinates
   const mouse = {
      x: null,
      y: null,
      radius: (canvas.height / 80) * (canvas.height / 80),
   };

   ctx.strokeStyle = pixelColor;
   ctx.fillStyle = pixelColor;
   ctx.font = '20px serif';
   ctx.fillText(fillTextMessage, 0, 40); // fillText(Txt, x, y, maxwidth(px))

   // ctx.strokeRect(0,0,100,100);

   // Data for 100 * 100 area of pixels
   const textCoordinateData = ctx.getImageData(0, 0, 100, 100);

   // ==Classes==

   class Particle {
      constructor(x, y) {
         this.x = x;
         this.y = y;
         this.distance;
         this.size = 3; //Radius

         // Initial position
         this.baseX = this.x;
         this.baseY = this.y;
         // Weight
         this.density = Math.random() * 30 + 1;
      }

      // Display particle on canvas
      draw() {
         ctx.fillStyle = pixelColor;
         ctx.beginPath();
         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
         ctx.closePath();
         ctx.fill();
      }

      // Calculate distance from particle to mouse
      update() {
         // Coords to find right angle between particle, mouse
         let differenceX = mouse.x - this.x;
         let differenceY = mouse.y - this.y;

         // Hypoteneuse
         let distance = Math.sqrt(
            differenceX * differenceX + differenceY * differenceY
         );
         this.distance = distance;

         // Speed which particles move relative to mouse distance
         let forceDirectionX = differenceX / distance;
         let forceDirectionY = differenceY / distance;

         // Maximum area affected by mouse movement
         let maxDistance = mouse.radius;

         // Percentage distance of particle relative to canvas edge. maxdistance to get value 0-1 for a percentage of distance to the edge.
         let force = (maxDistance - distance) / maxDistance;
         if (force < 0) force = 0;

         // Culmination of factors in particle's movement speed. Random density to simulate particle weight
         let directionX = forceDirectionX * force * this.density;
         let directionY = forceDirectionY * force * this.density;

         if (distance <= mouse.radius) {
            this.size = 5;
            this.x -= directionX;
            this.y -= directionY;
         } else {
            // Particle position has changed, find distance between new and original positions while not in range of mouse
            if (this.x !== this.baseX) {
               differenceX = this.x - this.baseX;
               // Move back to original position(slower)
               this.x -= differenceX / 10;
            }
            if (this.y !== this.baseY) {
               differenceY = this.y - this.baseY;
               this.y -= differenceY / 10;
            }
            this.size = 3;
         }
      }
   }

   // ==Functions==

   function initialize() {
      // Empty
      particleArray = [];

      // Scan grid of selected pixels row by row. Data stores RGBA values per pixel. Step through every 4th element to obtain alpha
      // for(let y = 0, y2 = textCoordinateData.height; y < y2; y++) {
      //     for(let x = 0, x2 = textCoordinateData.width; x < x2; x++){
      //         // Step through at every 4th element. I needed help with this line.
      //         // 128 is roughly 50% alpha implying visible pixel.
      //         if(textCoordinateData.data[(y * 4 * textCoordinateData.width) + (x * 4) + 3] > 128){
      //             let positionX = x + imageAdjustX;
      //             let positionY = y + imageAdjustY;
      //             // Populate, Multiply for distance between particles when displayed
      //             particleArray.push(new Particle(positionX * 12,positionY * 12));
      //         }
      //     }
      // }

      // Random distribution
      // for(let i = 0; i <= 500; i++){
      //     let x = Math.random() * canvas.width;
      //     let y = Math.random() * canvas.height;
      //     particleArray.push(new Particle(x,y));
      // }

      particleArray.push(new Particle(100, 200));
   }
   initialize();

   function animate() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particleArray.forEach((particle) => {
         particle.draw();
         particle.update();
      });
      // connectParticles();
      requestAnimationFrame(animate);
   }
   animate();

   function connectParticles() {
      let opacity = 1;
      for (let a = 0; a < particleArray.length; a++) {
         // Check remaining particles not already checked by a
         for (let b = a; b < particleArray.length; b++) {
            let connectDifferenceX = particleArray[a].x - particleArray[b].x;
            let connectDifferenceY = particleArray[a].y - particleArray[b].y;

            let connectionDistance = Math.sqrt(
               connectDifferenceX * connectDifferenceX +
                  connectDifferenceY * connectDifferenceY
            );

            let mouseDifferenceX = mouse.x - particleArray[a].x;
            let mouseDifferenceY = mouse.y - particleArray[a].y;
            let mouseDistance = Math.sqrt(
               mouseDifferenceX * mouseDifferenceX +
                  mouseDifferenceY * mouseDifferenceY
            );

            if (connectionDistance <= 20) {
               // Setup for lines
               ctx.lineWidth = 2;
               // Line opacity increases as particles get further apart (division same as distance so opacity = 0 at max distance)
               opacity = 1 - connectionDistance / 20;
               ctx.strokeStyle = 'rgba(255,255,255,' + opacity + ')';

               // Begin line at particle a, end at particle b
               ctx.beginPath();
               ctx.moveTo(particleArray[a].x, particleArray[a].y);
               ctx.lineTo(particleArray[b].x, particleArray[b].y);
               ctx.stroke();
            }
         }
      }
   }

   function colorParticles(p) {
      if (p.distance <= mouse.radius) {
         let hue = 100;

         pixelColor = 'hsl(' + hue + ',50%,50%)';
         pixelColor = 'hsl(' + hue + ',50%,50%)';
      } else {
         pixelColor = 'hsl(' + intialHue + ',50%,50%)';
         pixelColor = 'hsl(' + intialHue + ',50%,50%)';
      }
   }

   function debounce(func, timeout = 300) {
      let timer;
      return (...args) => {
         clearTimeout(timer);
         timer = setTimeout(() => {
            func.apply(this, args);
         }, timeout);
      };
   }

   function updateCanvasSize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initialize();
   }
});
