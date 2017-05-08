addEventListener('load', init);
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();
var source;
var canvasCtx;

//	Get the canvas context and initialize the audio analyser
function init() {
	canvasCtx = document.getElementById('c').getContext('2d');
	navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream){
		source = audioCtx.createMediaStreamSource(stream);
		source.connect(analyser);
		visualize();
	}).catch(function(err){
		console.log(err.name + ": " + err.message)
	});
}

// Resize the Canvas every frame to match the browser size
function resizeCanvas(){
	canvasCtx.canvas.width = window.innerWidth;
	canvasCtx.canvas.height = window.innerHeight;
}

function visualize(){

	//	Max size: 32768
	analyser.fftSize = 256;

	/*
	 *	The frequency bin count is always half of fftSize.
	 *	Since the frequency bands are split evenly, each element
	 *	N in dataArray will correspond to:

	 *	N * sampleRate / fftSize
	 *
	 *	Note that the Audio Context defaults to sampleRate = 48000
	 */

	var bufferLength = analyser.frequencyBinCount;
	var dataArray = new Uint8Array(bufferLength);
	//	canvasCtx.clearRect(0,0,canvasCtx.canvas.width,canvasCtx.canvas.height);

	function draw() {

		/*
		 *	Dynamically resize the canvas every frame to match the browser size.
		 *	This ensures that it is rendered correctly even if the window size has
		 *	changed.
		 */
		resizeCanvas();

		requestAnimationFrame(draw);

		//	Fills 'dataArray' with frequency data from the audio source.
		analyser.getByteFrequencyData(dataArray);

		var barWidth = (canvasCtx.canvas.width / bufferLength) * 1.5;
		var barHeight;
		var x = 0;

		// Initialize the gradient color for the background
		const grd = canvasCtx.createLinearGradient(0, 0, 170, canvasCtx.canvas.height);
		grd.addColorStop(0, 'rgba(100, 200, 230, 1)');
		grd.addColorStop(1, 'rgba(102, 102, 255, 0.5)');

		/*
			Preset 1:
			grd.addColorStop(0, 'rgba(100, 200, 230, 1)');
			grd.addColorStop(1, 'rgba(102, 102, 255, 0.5)');
			canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',100,250)';
		*/

		// Apply the gradient to the next rectangle to be drawn, then set it as the background
		canvasCtx.fillStyle = grd;
		canvasCtx.fillRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

		for(var i = 0; i < bufferLength; i++){
			barHeight = dataArray[i]*2+10;
			canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',100,250)';
			canvasCtx.fillRect(x,canvasCtx.canvas.height-barHeight/2-canvasCtx.canvas.height/2, barWidth, barHeight);

			x += barWidth + 1;
		}
	}
	draw();
}