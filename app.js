const AUDIO_CONTEXT = new AudioContext();
const ANALYSER = AUDIO_CONTEXT.createAnalyser();
//	**************	Settings stuff	**************
//	Selected visualization style. This will determine which visualization function to run/stop
var selected = '';
//	"Frequency Bars" settings variables
var freq_bars_sliders;
var freq_bars_values;
var freq_bars_checkboxes;

//	Entry point to the whole app
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
				//	Tubular
				case 0:
					visualizeTubular();
					break;
				//	Frequency Bars
				case 1:
					visualizeFrequencyBars();
					break;
				case 2:
					visualizeWaveform();
					break;
			}
		});
	}
	//	"Frequency Bars" is the default style when the app starts
	STYLES[0].click();
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
				if(i === 3 || i === 7 || i === 11 || i === 13){
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
					'max': 13
				},
				connect: [true, false]
			});
		}
		else if(i === 13){
			noUiSlider.create(freq_bars_sliders[i],{
				start: 0.6,
				step: 0.01,
				range: {
					'min': 0.0,
					'max': 1.0
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

	//	Automation Checkboxes
	freq_bars_checkboxes = document.getElementsByTagName('input');

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
					presetSliderSettings = [100, 200, 230, 1.0, 102, 102, 255, 0.5, 85, 100, 250, 1.0, 8, 0.30];
					for(let k=0; k<freq_bars_sliders.length; k++){
						let presetValue = presetSliderSettings[k];
						freq_bars_sliders[k].noUiSlider.set(presetValue);
					}
					freq_bars_checkboxes[0].checked = true;
					freq_bars_checkboxes[1].checked = false;
					freq_bars_checkboxes[2].checked = false;
					break;
				//	Neon Purple
				case 1:
					presetSliderSettings = [255, 74, 243, 1.0, 0, 17, 20, 0.63, 55, 227, 101, 1.0, 8, 0.35];
					for(let k=0; k<freq_bars_sliders.length; k++){
						let presetValue = presetSliderSettings[k];
						freq_bars_sliders[k].noUiSlider.set(presetValue);
					}
					freq_bars_checkboxes[0].checked = true;
					freq_bars_checkboxes[1].checked = false;
					freq_bars_checkboxes[2].checked = false;
					break;
				//	Twilight
				case 2:
					presetSliderSettings = [0, 0, 49, 1.0, 19, 0, 0, 0.85, 51, 8, 206, 0.32, 9, 0.30];
					for(let k=0; k<freq_bars_sliders.length; k++){
						let presetValue = presetSliderSettings[k];
						freq_bars_sliders[k].noUiSlider.set(presetValue);
					}
					freq_bars_checkboxes[0].checked = false;
					freq_bars_checkboxes[1].checked = true;
					freq_bars_checkboxes[2].checked = true;
					break;
				//	Chill vibes
				case 3:
					presetSliderSettings = [238, 90, 20, 0.56, 255, 74, 243, 1.0, 54, 198, 185, 0.68, 9, 0.42];
					for(let k=0; k<freq_bars_sliders.length; k++){
						let presetValue = presetSliderSettings[k];
						freq_bars_sliders[k].noUiSlider.set(presetValue);
					}
					freq_bars_checkboxes[0].checked = false;
					freq_bars_checkboxes[1].checked = true;
					freq_bars_checkboxes[2].checked = false;
					break;
			}
		});
	}
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

function visualizeFrequencyBars(){
	//	Create a new Canvas element and insert it into the DOM
	var canvasElement = document.createElement('canvas')
	canvasElement.setAttribute('id', 'c');
	document.body.appendChild(canvasElement);
	var canvasCtx = document.getElementById('c').getContext('2d');

	function draw() {
		//	Resize the canvas every frame to match the window size
		canvasCtx.canvas.width = window.innerWidth;
		canvasCtx.canvas.height = window.innerHeight;
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

		//	Bar Height slider
		var barHeight_setting = freq_bars_sliders[13].noUiSlider.get();

		// Initialize the gradient color for the background
		const grd = canvasCtx.createLinearGradient(0, 0, 170, canvasCtx.canvas.height);
		//	Color the background
		grd.addColorStop(0, 'rgba('+ background1_r +', '+ background1_g +', '+ background1_b +', '+ background1_a +')');
		grd.addColorStop(1, 'rgba('+ background2_r +', '+ background2_g +', '+ background2_b +', '+ background2_a +')');
		//	Apply the gradient to the next rectangle to be drawn, then set it as the background
		canvasCtx.fillStyle = grd;
		canvasCtx.fillRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
		//	Responsive Bar Colors
		var responsiveBarColor_r = 0;
		var responsiveBarColor_g = 0;
		var responsiveBarColor_b = 0;
		if(freq_bars_checkboxes[0].checked === true){
			responsiveBarColor_r = 1;
		}
		else{
			responsiveBarColor_r = 0;
		}
		if(freq_bars_checkboxes[1].checked === true){
			responsiveBarColor_g = 1;
		}
		else{
			responsiveBarColor_g = 0;
		}
		if(freq_bars_checkboxes[2].checked === true){
			responsiveBarColor_b = 1;
		}
		else{
			responsiveBarColor_b = 0;
		}
		//	Draw the bars
		var barWidth = (canvasCtx.canvas.width / bufferLength);
		var barHeight;
		var x = 0;
		for(var i = 0; i < bufferLength; i++){
			barHeight = Math.round(window.innerHeight*barHeight_setting*(dataArray[i] / 256)+10);
			//	RGB needs to take integers, so we need to round 'barHeight'.
			canvasCtx.fillStyle = 'rgba(' + ((dataArray[i]*responsiveBarColor_r) + barColor_r) + ','+ ((dataArray[i]*responsiveBarColor_g) + barColor_g) +', '+ ((dataArray[i]*responsiveBarColor_b) + barColor_b) +', '+ barColor_a +')';
			canvasCtx.fillRect(x,canvasCtx.canvas.height-barHeight/2-canvasCtx.canvas.height/2, barWidth, barHeight);
			x += barWidth + 1;
		}
	}
	draw();
}

function visualizeTubular(){
	//	Create a new Canvas element and insert it into the DOM
	var canvasElement = document.createElement('canvas')
	canvasElement.setAttribute('id', 's');
	document.body.appendChild(canvasElement);
	canvasCtx = document.getElementById('s').getContext('2d');

	var rotation = 0;
	var velocity = 0;

	function draw() {
		//	Resize the canvas every frame to match the window size
		canvasCtx.canvas.width = window.innerWidth;
		canvasCtx.canvas.height = window.innerHeight;
		const WIDTH = canvasCtx.canvas.width;
		const HEIGHT = canvasCtx.canvas.height;

		//	Check if this is still the selected visualization style
		if(selected === 'Tubular'){
			requestAnimationFrame(draw);
		}
		ANALYSER.fftSize = 512;

		var bufferLength = ANALYSER.frequencyBinCount;
		var dataArray = new Uint8Array(bufferLength);
		//	Fills 'dataArray' with frequency data from the audio source.
		ANALYSER.getByteFrequencyData(dataArray);

		const grd = canvasCtx.createLinearGradient(0, 0, 170, HEIGHT);
		//	Color the background
		grd.addColorStop(0, 'rgba(5, 5, 15, 1.0)');
		grd.addColorStop(1, 'rgba(5, 10, 15, 1.0)');
		//	Apply the gradient to the next rectangle to be drawn, then set it as the background
		canvasCtx.fillStyle = grd;
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

		rotation += dataArray[3]/15000
		console.log(0);
		if(rotation < 2*Math.PI){
			//rotation += (Math.PI/360)
		}
		else{
			rotation = 0;
		}

		if(velocity < 120){
			velocity += 1;
		}
		else{
			velocity = 0;
		}

		for(let i=1; i< 60; i+= 1){
			const radius = 50 + (Math.pow(i, 1.8)) + velocity;
			const arcStart = (i/24) + rotation;
			const arcEnd = (Math.PI/12)+(i/24)+(i/100) + rotation;

			//	First "blade"
			canvasCtx.beginPath();
			canvasCtx.lineWidth = Math.pow((i/5), 1.2);
			canvasCtx.strokeStyle = 'rgba(250, 250, 250, 1.0)';
			canvasCtx.arc(WIDTH/2, HEIGHT/2, radius, arcStart, arcEnd);
			canvasCtx.stroke();
			canvasCtx.closePath();

			//	Second blade
			canvasCtx.beginPath();
			canvasCtx.lineWidth = Math.pow((i/5), 1.2);
			canvasCtx.strokeStyle = 'rgba(250, 250, 250, 1.0)';
			canvasCtx.arc(WIDTH/2, HEIGHT/2, radius, arcStart + (Math.PI*2/3), arcEnd + (Math.PI*2/3));
			canvasCtx.stroke();
			canvasCtx.closePath();

			//	Third Blade
			canvasCtx.beginPath();
			canvasCtx.lineWidth = Math.pow((i/5), 1.2);
			canvasCtx.strokeStyle = 'rgba(250, 250, 250, 1.0)';
			canvasCtx.arc(WIDTH/2, HEIGHT/2, radius, arcStart + (Math.PI*2/3*2), arcEnd + (Math.PI*2/3*2));
			canvasCtx.stroke();
			canvasCtx.closePath();
		}

		//	Random stuff
		canvasCtx.beginPath();
		canvasCtx.arc(WIDTH/2, HEIGHT/2, dataArray[25]/2+100, 0, 2 * Math.PI);
		canvasCtx.fillStyle = '#000000';
		canvasCtx.fill();
		canvasCtx.closePath();

		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(150, 20, 100, 1.0)';
		canvasCtx.lineWidth = 4;
		canvasCtx.arc(WIDTH/2, HEIGHT/2, dataArray[25]/2+105, Math.PI, Math.PI + 2);
		canvasCtx.stroke();
		canvasCtx.closePath();

		canvasCtx.lineWidth = 1;
		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(0, 255, 100, 1.0)';
		canvasCtx.arc(WIDTH/2, HEIGHT/2, dataArray[25]/2+250, 0, 0.5 * Math.PI);
		canvasCtx.stroke();
		canvasCtx.closePath();

		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(150, 20, 100, 1.0)';
		canvasCtx.arc(WIDTH/2, HEIGHT/2, dataArray[25]/2+250, 0.5 * Math.PI, Math.PI + 1);
		canvasCtx.stroke();
		canvasCtx.closePath();
	}
	draw();
}

function visualizeWaveform(){
	//	Create a new Canvas element and insert it into the DOM
	var canvasElement = document.createElement('canvas')
	canvasElement.setAttribute('id', 'c');
	document.body.appendChild(canvasElement);
	canvasCtx = document.getElementById('c').getContext('2d');


	function draw() {
		//	Resize the canvas every frame to match the window size
		canvasCtx.canvas.width = window.innerWidth;
		canvasCtx.canvas.height = window.innerHeight;
		//	Check if this is still the selected visualization style
		if(selected === 'Waveform'){
			requestAnimationFrame(draw);
		}
		ANALYSER.fftSize = 128;

		var bufferLength = ANALYSER.frequencyBinCount;
		var dataArray = new Uint8Array(bufferLength);
		//	Fills 'dataArray' with frequency data from the audio source.
		ANALYSER.getByteFrequencyData(dataArray);

		const grd = canvasCtx.createLinearGradient(0, 0, 170, canvasCtx.canvas.height);
		//	Color the background
		grd.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
		grd.addColorStop(1, 'rgba(0, 0, 0, 1.0)');
		//	Apply the gradient to the next rectangle to be drawn, then set it as the background
		canvasCtx.fillStyle = grd;
		canvasCtx.fillRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

		canvasCtx.lineWidth = 3;
		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
		var sectionWidth = canvasCtx.canvas.width / bufferLength;
		var x = 0;

		console.log(dataArray);
		for(let i=0; i<bufferLength; i++){
			var v = dataArray[i] / 128.0;
			var y = v * canvasCtx.canvas.height/2;

			if(i == 0) {
				canvasCtx.moveTo(x, y);
			}
			else{
				canvasCtx.lineTo(x, y);
			}

			x += sectionWidth;
		}

		canvasCtx.lineTo(canvasCtx.canvas.width, canvasCtx.canvas.height/2);
		canvasCtx.closePath();
		canvasCtx.stroke();
	}
	draw();
}

