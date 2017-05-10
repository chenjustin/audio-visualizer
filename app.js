const AUDIO_CONTEXT = new AudioContext();
const ANALYSER = AUDIO_CONTEXT.createAnalyser();

//	**************	Settings stuff	**************
//	Selected visualization style. This will determine which visualization function to run/stop
var selected = '';

//	"Frequency Bars" settings variables
var freq_bars_sliders;
var freq_bars_values;

//	Entry point for the whole app.
window.onload = function init() {

	//	Use sound card's "Stereo Mix" as the audio source, then connect it to ANALYSER
	//	so we can extract frequency data from it to visualize
	navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream){
		var source = AUDIO_CONTEXT.createMediaStreamSource(stream);
		source.connect(ANALYSER);
	}).catch(function(err){
		console.log(err.name + ": " + err.message)
	});

	//	Initializes the Sliding Menu by adding an event listener to the button
	initMenu();

	//	Initializes the Frequency Bars settings with event listeners and sliders
	initFreqBarsStyleSettings();

	//	Initializes the Style Chooser with event listeners
	initVizStyleChooser();

}

//	**************	Visualization style selection	**************
function initVizStyleChooser(){

	const STYLES = document.getElementsByClassName('viz-style');

	for(let i=0; i<STYLES.length; i++){

		STYLES[i].addEventListener('click', function(){

			//	Clear any existing canvas
			var toClear = document.getElementsByTagName('canvas');
			for(let i=0; i<toClear.length; i++){
				toClear[i].remove();
			}

			//	Deselect all the other Styles
			for(let j=0; j<STYLES.length; j++){
				STYLES[j].className = 'viz-style generic-menu-item';
			}

			STYLES[i].className = 'viz-style generic-menu-item selected';
			selected = STYLES[i].innerHTML;

			switch(i){
				//	Krazy Lines
				case 0:
					break;

				//	Frequency Bars
				case 1:
					visualizeFrequencyBars();
			}
		});
	}

	//	"Frequency Bars" is the default style when the app starts
	STYLES[1].click();
}

//	**************	"Frequency Bars" Style Settings 	**************
function initFreqBarsStyleSettings(){
	//	All the "Frequency Bars" settings sliders
	freq_bars_sliders = document.getElementsByClassName('freq-bars-slider');
	freq_bars_values = document.getElementsByClassName('freq-bars-slider-value');

	//	Callback function in response to a slider's update' events. 
	//	This function updates the display value on the page to reflect the value of the slider 
	function updateSliderDisplayValue(){
		for(let i=0; i<freq_bars_sliders.length; i++){
			if(typeof freq_bars_sliders[i].noUiSlider != 'undefined'){
				if(i === 3 || i === 7 || i === 11){
					freq_bars_values[i].innerHTML = freq_bars_sliders[i].noUiSlider.get();
				}
				else if(i === 12){
					freq_bars_values[i].innerHTML = Math.pow(2, Math.round(freq_bars_sliders[i].noUiSlider.get()))/2;
				}
				else{
					freq_bars_values[i].innerHTML = Math.round(freq_bars_sliders[i].noUiSlider.get());
				}
			}
		}
	}

	/*
		Initializes an array to hold all the sliders for "Frequency Bars".
		Uses noUiSlider's constructor to create mulitple sliders.

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
		//	i=12 is the BAR COUNT slider.
		else if(i === 12){
			noUiSlider.create(freq_bars_sliders[i],{
				start: 9,
				step: 1,
				range: {
					'min': 5,
					'max': 14
				},
				connect: [true, false]
			});
		}
		//	RGB Sliders
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
		freq_bars_sliders[i].noUiSlider.on('update', updateSliderDisplayValue);
	}


	//	**************PRESET STYLE SELECTION**************

	//	Store all the preset choices into an array so we can programatically add
	//	event listeners to each.
	const BARS_PRESETS = document.getElementsByClassName('bars-presets');

	for(let i=0; i<BARS_PRESETS.length; i++){

		BARS_PRESETS[i].addEventListener('click', function(){

			//	Deselect all the presets, then select the one that was clicked
			for(let j=0; j<BARS_PRESETS.length; j++){
				BARS_PRESETS[j].className = "bars-presets generic-menu-item";
			}
			BARS_PRESETS[i].className = "bars-presets generic-menu-item selected";
			
			let presetSliderSettings;

			switch(i){

				//	Blue Sky
				case 0:
					presetSliderSettings = [100, 200, 230, 1.0, 102, 102, 255, 0.5, 85, 100, 250, 1.0, 8];
					for(let k=0; k<freq_bars_sliders.length; k++){
						let presetValue = presetSliderSettings[k];
						freq_bars_sliders[k].noUiSlider.set(presetValue);
					}
					break;

				//	Neon Purple
				case 1:
					presetSliderSettings = [255, 74, 243, 1.0, 0, 17, 20, 0.63, 55, 227, 101, 1.0, 8];
					for(let k=0; k<freq_bars_sliders.length; k++){
						let presetValue = presetSliderSettings[k];
						freq_bars_sliders[k].noUiSlider.set(presetValue);
					}
					break;

				//	Twilight
				case 2:
					presetSliderSettings = [0, 0, 49, 1.0, 19, 0, 0, 0.85, 9, 255, 255, 0.15, 8];
					for(let k=0; k<freq_bars_sliders.length; k++){
						let presetValue = presetSliderSettings[k];
						freq_bars_sliders[k].noUiSlider.set(presetValue);
					}
					break;
			}
		});
	}
	

	//	Twilight
	BARS_PRESETS[2].addEventListener('click', function(){
		freq_bars_sliders[0].noUiSlider.set(0);
		freq_bars_sliders[1].noUiSlider.set(0);
		freq_bars_sliders[2].noUiSlider.set(49);
		freq_bars_sliders[3].noUiSlider.set(1.0);
		freq_bars_sliders[4].noUiSlider.set(19);
		freq_bars_sliders[5].noUiSlider.set(0);
		freq_bars_sliders[6].noUiSlider.set(0);
		freq_bars_sliders[7].noUiSlider.set(0.85);
		freq_bars_sliders[8].noUiSlider.set(9);
		freq_bars_sliders[9].noUiSlider.set(255);
		freq_bars_sliders[10].noUiSlider.set(255);
		freq_bars_sliders[11].noUiSlider.set(0.15);
		for(let i=0; i<BARS_PRESETS.length; i++){
			BARS_PRESETS[i].className = "bars-presets generic-menu-item";
		}
		BARS_PRESETS[2].className = "bars-presets generic-menu-item selected";
	});

	//	Manually default to this preset
	BARS_PRESETS[0].click();
}

//	**************	Menu stuff	**************
function initMenu(){
	//	DOM Elements
	const SETTINGS_BUTTON = document.getElementById('settings-button');
	const SIDE_MENU = document.getElementById('side-menu');

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
}

// Resize the Canvas every frame to match the browser size
function resizeCanvas(){
	canvasCtx.canvas.width = window.innerWidth;
	canvasCtx.canvas.height = window.innerHeight;
}


function visualizeFrequencyBars(){

	//	Create a new Canvas element and insert it into the DOM
	var canvasElement = document.createElement('canvas')
	canvasElement.setAttribute('id', 'c');
	document.body.appendChild(canvasElement);
	canvasCtx = document.getElementById('c').getContext('2d');

	function draw() {

		/*
		 *	Dynamically resize the canvas every frame to match the browser size.
		 *	This ensures that it is rendered correctly even if the window size has
		 *	changed.
		 */
		resizeCanvas();

		//	Check if this is still the selected visualization style
		if(selected === 'Frequency Bars'){
			requestAnimationFrame(draw);
		}

		//	Read the value from the appropriate settings slider
		var bar_count = Math.pow(2, Math.round(freq_bars_sliders[12].noUiSlider.get()));

		//	Max size: 32768
		//	Must be a power of 2
		ANALYSER.fftSize = bar_count;

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


		//	Fills 'dataArray' with frequency data from the audio source.
		ANALYSER.getByteFrequencyData(dataArray);

		//	Get the color values from the slider settings
		//	Background 1 RGBA colors
		var background1_r = Math.round(freq_bars_sliders[0].noUiSlider.get());
		var background1_g = Math.round(freq_bars_sliders[1].noUiSlider.get());
		var background1_b = Math.round(freq_bars_sliders[2].noUiSlider.get());
		var background1_a = freq_bars_sliders[3].noUiSlider.get();
		//	Background 2 RGBA colors
		var background2_r = Math.round(freq_bars_sliders[4].noUiSlider.get());
		var background2_g = Math.round(freq_bars_sliders[5].noUiSlider.get());
		var background2_b = Math.round(freq_bars_sliders[6].noUiSlider.get());
		var background2_a = freq_bars_sliders[7].noUiSlider.get();
		//	Bar Color RGBA colors
		var barColor_r = Math.round(freq_bars_sliders[8].noUiSlider.get());
		var barColor_g = Math.round(freq_bars_sliders[9].noUiSlider.get());
		var barColor_b = Math.round(freq_bars_sliders[10].noUiSlider.get());
		var barColor_a = freq_bars_sliders[11].noUiSlider.get();

		// Initialize the gradient color for the background
		const grd = canvasCtx.createLinearGradient(0, 0, 170, canvasCtx.canvas.height);

		//	Color the background
		grd.addColorStop(0, 'rgba('+ background1_r +', '+ background1_g +', '+ background1_b +', '+ background1_a +')');
		grd.addColorStop(1, 'rgba('+ background2_r +', '+ background2_g +', '+ background2_b +', '+ background2_a +')');

		// Apply the gradient to the next rectangle to be drawn, then set it as the background
		canvasCtx.fillStyle = grd;
		canvasCtx.fillRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

		var barWidth = (canvasCtx.canvas.width / bufferLength);
		var barHeight;
		var x = 0;

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