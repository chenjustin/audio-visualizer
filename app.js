const AUDIO_CONTEXT = new AudioContext();
const ANALYSER = AUDIO_CONTEXT.createAnalyser();
var source;
var canvasCtx;

//	Get the canvas context and initialize the audio analyser
window.onload = function init() {

	//	Use sound card's "Stereo Mix" as the audio source, then connect it to ANALYSER
	//	so we can extract frequency data from it to visualize
	navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream){
		source = AUDIO_CONTEXT.createMediaStreamSource(stream);
		source.connect(ANALYSER);
		visualize();
	}).catch(function(err){
		console.log(err.name + ": " + err.message)
	});


	//	**************	DOM Elements	**************
	const SETTINGS_BUTTON = document.getElementById('settings-button');
	const SIDE_MENU = document.getElementById('side-menu');
	canvasCtx = document.getElementById('c').getContext('2d');

	//	**************	Menu stuff	**************
	//	All of the menu logic / click event listeners are here

	//	Toggle menu open/close
	var open = false
	SETTINGS_BUTTON.addEventListener('click', function(){
		if(open == false){
			open = true;
			SETTINGS_BUTTON.style.transform = 'translate(506px, 0px)';
			SETTINGS_BUTTON.className = 'fa fa-arrow-left fa-2x';
			SIDE_MENU.style.transform = 'translateX(0px)';
		}
		else{
			open = false;
			SETTINGS_BUTTON.style.transform = 'translate(0px, 0px)';
			SETTINGS_BUTTON.className = 'fa fa-arrow-right fa-2x';
			SIDE_MENU.style.transform = 'translateX(-510px)';
		}
	});

	//	**************	Visualization style selection	**************

	//	**************	"Frequency Bars" Style Settings 	**************
	//	Background RGB
	const BARS_BGCOLOR1_RED_SLIDER = document.getElementById('bars-bgcolor1-red-slider');
	const BARS_BGCOLOR1_GREEN_SLIDER = document.getElementById('bars-bgcolor1-green-slider');
	const BARS_BGCOLOR1_BLUE_SLIDER = document.getElementById('bars-bgcolor1-blue-slider');
	const BARS_BGCOLOR1_OPACITY_SLIDER = document.getElementById('bars-bgcolor1-opacity-slider');
	const BARS_BGCOLOR2_RED_SLIDER = document.getElementById('bars-bgcolor2-red-slider');
	const BARS_BGCOLOR2_GREEN_SLIDER = document.getElementById('bars-bgcolor2-green-slider');
	const BARS_BGCOLOR2_BLUE_SLIDER = document.getElementById('bars-bgcolor2-blue-slider');
	const BARS_BGCOLOR2_OPACITY_SLIDER = document.getElementById('bars-bgcolor2-opacity-slider');

	noUiSlider.create(BARS_BGCOLOR1_RED_SLIDER, {
		start: 80,
		step: 1,
		range: {
			'min': 0,
			'max': 255
		},
		connect: [true, false]
	});
	noUiSlider.create(BARS_BGCOLOR1_GREEN_SLIDER, {
		start: 80,
		step: 1,
		range: {
			'min': 0,
			'max': 255
		},
		connect: [true, false]
	});
	noUiSlider.create(BARS_BGCOLOR1_BLUE_SLIDER, {
		start: 80,
		step: 1,
		range: {
			'min': 0,
			'max': 255
		},
		connect: [true, false]
	});
	noUiSlider.create(BARS_BGCOLOR1_OPACITY_SLIDER, {
		start: 80,
		step: 1,
		range: {
			'min': 0,
			'max': 255
		},
		connect: [true, false]
	});
	noUiSlider.create(BARS_BGCOLOR2_RED_SLIDER, {
		start: 80,
		step: 1,
		range: {
			'min': 0,
			'max': 255
		},
		connect: [true, false]
	});
	noUiSlider.create(BARS_BGCOLOR2_GREEN_SLIDER, {
		start: 80,
		step: 1,
		range: {
			'min': 0,
			'max': 255
		},
		connect: [true, false]
	});
	noUiSlider.create(BARS_BGCOLOR2_BLUE_SLIDER, {
		start: 80,
		step: 1,
		range: {
			'min': 0,
			'max': 255
		},
		connect: [true, false]
	});
	noUiSlider.create(BARS_BGCOLOR2_OPACITY_SLIDER, {
		start: 80,
		step: 1,
		range: {
			'min': 0,
			'max': 255
		},
		connect: [true, false]
	});

}

// Resize the Canvas every frame to match the browser size
function resizeCanvas(){
	canvasCtx.canvas.width = window.innerWidth;
	canvasCtx.canvas.height = window.innerHeight;
}

//
function visualize(){

	//	Max size: 32768
	//	Must be a power of 2
	ANALYSER.fftSize = 512;

	/*
	 *	The frequency bin count is always half of fftSize.
	 *	Since the frequency bands are split evenly, each element
	 *	N in dataArray will correspond to:

	 *	N * sampleRate / fftSize
	 *
	 *	Note that the Audio Context defaults to sampleRate = 48000
	 */

	var bufferLength = ANALYSER.frequencyBinCount;
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
		ANALYSER.getByteFrequencyData(dataArray);

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
			barHeight = dataArray[i] * 1.4 + 10;

			//	RGB needs to take integers, so we need to round 'barHeight'.
			canvasCtx.fillStyle = 'rgb(' + (Math.round(barHeight)+100) + ',100, 250)';
			canvasCtx.fillRect(x,canvasCtx.canvas.height-barHeight/2-canvasCtx.canvas.height/2, barWidth, barHeight);

			x += barWidth + 1;
		}
	}
	draw();
}