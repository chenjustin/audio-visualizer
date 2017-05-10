const AUDIO_CONTEXT = new AudioContext();
const ANALYSER = AUDIO_CONTEXT.createAnalyser();
var canvasCtx;

//	**************	Settings stuff	**************
//	"Frequency Bars" settings variables
var freq_bars_sliders;
var freq_bars_values;


//	Get the canvas context and initialize the audio analyser
window.onload = function init() {

	//	Use sound card's "Stereo Mix" as the audio source, then connect it to ANALYSER
	//	so we can extract frequency data from it to visualize
	navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream){
		var source = AUDIO_CONTEXT.createMediaStreamSource(stream);
		source.connect(ANALYSER);
		visualizeFrequencyBars();
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

	//	All the "Frequency Bars" settings sliders
	freq_bars_sliders = document.getElementsByClassName('freq-bars-slider');
	freq_bars_values = document.getElementsByClassName('freq-bars-slider-value');

	/*
		Initializes an array to hold all the sliders for "Frequency Bars".

		freq_bars_sliders[0] = BG1 Red
		freq_bars_sliders[1] = BG1 Green
		freq_bars_sliders[2] = BG1 Blue
		freq_bars_sliders[3] = BG1 Alpha
		freq_bars_sliders[4] = BG2 Red
		freq_bars_sliders[5] = BG2 Green
		freq_bars_sliders[6] = BG2 Blue
		freq_bars_sliders[7] = BG2 Alpha

		...etc
	*/
	for(let i = 0; i < freq_bars_sliders.length; i++){

		//	i=3, i=7, and i=11 are opacity sliders. They have a different scale
		if(i === 3 || i === 7 || i === 11){
			noUiSlider.create(freq_bars_sliders[i],{
				start: 1.0,
				step: 0.01,
				range: {
					'min': 0,
					'max': 1.0
				},
				connect: [true, false]
			});
		}
		else{
			noUiSlider.create(freq_bars_sliders[i],{
				start: 120,
				step: 1,
				range: {
					'min': 0,
					'max': 255
				},
				connect: [true, false]
			});
		}

		//	Bind callback function to the 'update' event for this particular slider
		freq_bars_sliders[i].noUiSlider.on('update', setFreqBarsColors);
	}


	/*
		Preset 1:
		grd.addColorStop(0, 'rgba(100, 200, 230, 1)');
		grd.addColorStop(1, 'rgba(102, 102, 255, 0.5)');
		canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',100,250)';
	*/

	const BARS_PRESETS = document.getElementsByClassName('bars-presets');

	//	1980's Miami Preset
	BARS_PRESETS[0].addEventListener('click', function(){
		freq_bars_sliders[0].noUiSlider.set(100);
		freq_bars_sliders[1].noUiSlider.set(200);
		freq_bars_sliders[2].noUiSlider.set(230);
		freq_bars_sliders[3].noUiSlider.set(1.0);
		freq_bars_sliders[4].noUiSlider.set(102);
		freq_bars_sliders[5].noUiSlider.set(102);
		freq_bars_sliders[6].noUiSlider.set(255);
		freq_bars_sliders[7].noUiSlider.set(0.5);
		freq_bars_sliders[8].noUiSlider.set(85);
		freq_bars_sliders[9].noUiSlider.set(100);
		freq_bars_sliders[10].noUiSlider.set(250);
		freq_bars_sliders[11].noUiSlider.set(1.0);
		for(let i=0; i<BARS_PRESETS.length; i++){
			BARS_PRESETS[i].className = "bars-presets generic-menu-item";
		}
		BARS_PRESETS[0].className = "bars-presets generic-menu-item selected";
	});

	//	Manually default to this preset
	BARS_PRESETS[0].click();
}

function setFreqBarsColors(){
	for(let i=0; i<freq_bars_sliders.length; i++){
		if(typeof freq_bars_sliders[i].noUiSlider != 'undefined'){
			if(i === 3 || i === 7 || i === 11){
				freq_bars_values[i].innerHTML = freq_bars_sliders[i].noUiSlider.get();
			}
			else{
				freq_bars_values[i].innerHTML = Math.round(freq_bars_sliders[i].noUiSlider.get());
			}
		}
	}
}

// Resize the Canvas every frame to match the browser size
function resizeCanvas(){
	canvasCtx.canvas.width = window.innerWidth;
	canvasCtx.canvas.height = window.innerHeight;
}

//
function visualizeFrequencyBars(){

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

		//	Get the color values from the slider settings
		//	Background 1 RGBA colors
		let background1_r = Math.round(freq_bars_sliders[0].noUiSlider.get());
		let background1_g = Math.round(freq_bars_sliders[1].noUiSlider.get());
		let background1_b = Math.round(freq_bars_sliders[2].noUiSlider.get());
		let background1_a = freq_bars_sliders[3].noUiSlider.get();
		//	Background 2 RGBA colors
		let background2_r = Math.round(freq_bars_sliders[4].noUiSlider.get());
		let background2_g = Math.round(freq_bars_sliders[5].noUiSlider.get());
		let background2_b = Math.round(freq_bars_sliders[6].noUiSlider.get());
		let background2_a = freq_bars_sliders[7].noUiSlider.get();
		//	Bar Color RGBA colors
		let barColor_r = Math.round(freq_bars_sliders[8].noUiSlider.get());
		let barColor_g = Math.round(freq_bars_sliders[9].noUiSlider.get());
		let barColor_b = Math.round(freq_bars_sliders[10].noUiSlider.get());
		let barColor_a = freq_bars_sliders[11].noUiSlider.get();

		// Initialize the gradient color for the background
		const grd = canvasCtx.createLinearGradient(0, 0, 170, canvasCtx.canvas.height);

		//	Color the background
		grd.addColorStop(0, 'rgba('+ background1_r +', '+ background1_g +', '+ background1_b +', '+ background1_a +')');
		grd.addColorStop(1, 'rgba('+ background2_r +', '+ background2_g +', '+ background2_b +', '+ background2_a +')');

		// Apply the gradient to the next rectangle to be drawn, then set it as the background
		canvasCtx.fillStyle = grd;
		canvasCtx.fillRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

		for(var i = 0; i < bufferLength; i++){
			barHeight = Math.round(dataArray[i] * 1.4 + 10);

			//	RGB needs to take integers, so we need to round 'barHeight'.
			canvasCtx.fillStyle = 'rgba(' + (dataArray[i] + barColor_r + 10) + ','+ barColor_g +', '+ barColor_b +', '+ barColor_a +')';
			canvasCtx.fillRect(x,canvasCtx.canvas.height-barHeight/2-canvasCtx.canvas.height/2, barWidth, barHeight);

			x += barWidth + 1;
		}
	}
	draw();
}