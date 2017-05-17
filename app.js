const AUDIO_CONTEXT = new AudioContext();
const ANALYSER = AUDIO_CONTEXT.createAnalyser();
//	**************	Settings stuff	**************
//	Selected visualization style. This will determine which visualization function to run/stop
var selected = '';

//	"Frequency Bars" settings variables
var freq_bars_sliders;
var freq_bars_values;
var freq_bars_checkboxes;

//	"Windmill" settings variables
var windmill_sliders;
var windmill_sliders_values;
var windmill_checkboxes

//	FPS counter for testing
var lastLoop = (new Date()).getMilliseconds();
var fpsCounter = 1;
var fps = 0;
var showFPS = function(){
	var currentLoop = (new Date()).getMilliseconds();
		if(lastLoop > currentLoop){
			fps = fpsCounter;
			fpsCounter = 1;
		}
		else{
			fpsCounter += 1;
		}
		lastLoop = currentLoop;
		console.log(fps);
}

var WIDTH, HEIGHT;

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
	//	Initializes the Windmill settings the same way as above
	initWindmillStyleSettings();
	//	Initializes the Style Chooser with event listeners
	initVizStyleChooser();
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

//	**************	Visualization style selection	**************
function initVizStyleChooser(){
	const STYLES = document.getElementsByClassName('viz-style');
	const STYLE_SETTINGS_MENU = document.getElementsByClassName('viz-settings-visibility');
	
	for(let i=0; i<STYLES.length; i++){
		STYLES[i].addEventListener('click', function(){
			//	Clear any existing canvas
			var toClear = document.getElementsByTagName('canvas');
			for(let i=0; i<toClear.length; i++){
				toClear[i].remove();
			}

			//	Deselect all the other Styles
			for(let j=0; j < STYLES.length; j++){
				STYLES[j].className = 'viz-style generic-menu-item';
				STYLE_SETTINGS_MENU[j].style = "display: none;"
			}

			STYLES[i].className = 'viz-style generic-menu-item selected';
			selected = STYLES[i].innerHTML;

			switch(i){
				//	Windmill
				case 0:
					STYLE_SETTINGS_MENU[i].style = "display: block;"
					visualizeWindmill();
					break;
				//	Frequency Bars
				case 1:
					STYLE_SETTINGS_MENU[i].style = "display: block;"
					visualizeFrequencyBars();
					break;
				case 2:
					visualizeNew();
					break;
			}
		});
	}
	//	"Windmill" is the default style when the app starts
	STYLES[0].click();
}

//	**************	"Windmill" Style Settings 	**************
function initWindmillStyleSettings(){
	windmill_sliders = document.getElementsByClassName('windmill-slider');
	windmill_sliders_values = document.getElementsByClassName('windmill-slider-value');
	windmill_checkboxes = document.getElementsByClassName('toggle-windmill');
	const WINDMILL_PRESETS = document.getElementsByClassName('windmill-presets');

	function updateSliderDisplayValue(){

		for(let i=0; i<windmill_sliders.length; i++){
			if(typeof windmill_sliders[i].noUiSlider != 'undefined'){
				if(i === 3 || i === 7 || i === 8 || i === 12 || i === 13){
					windmill_sliders_values[i].innerHTML = windmill_sliders[i].noUiSlider.get();
				}
				else{
					windmill_sliders_values[i].innerHTML = Math.round(windmill_sliders[i].noUiSlider.get());
				}
			}
		}
	}

	function createSliders(){

		for(let i=0; i<windmill_sliders.length;i++){
			//	Alphas
			if(i === 3 || i === 7 || i === 12 ){
				noUiSlider.create(windmill_sliders[i],{
						start: 1,
						step: 0.01,
						range: {
							'min': 0,
							'max': 1.0
						},
						connect: [true, false]
				});
			}
			//	Chaos slider
			else if(i === 13){
				noUiSlider.create(windmill_sliders[i],{
						start: 0,
						step: 0.01,
						range: {
							'min': 0,
							'max': 3.5
						},
						connect: [true, false]
				});
			}
			//	Blade Width
			else if(i === 8){
				noUiSlider.create(windmill_sliders[i],{
						start: 0.5,
						step: 0.1,
						range: {
							'min': 0.2,
							'max': 5.0
						},
						connect: [true, false]
				});
			}
			else{
				noUiSlider.create(windmill_sliders[i],{
						start: 120,
						step: 1,
						range: {
							'min': 0,
							'max': 255
						},
						connect: [true, false]
				});
			}
			windmill_sliders[i].noUiSlider.on('update', updateSliderDisplayValue);
		}
	}

	function initPresets(){

		for(let i=0; i<WINDMILL_PRESETS.length; i++){
			WINDMILL_PRESETS[i].addEventListener('click', function(){
				//	Deselect all the presets, then select the one that was clicked
				for(let j=0; j<WINDMILL_PRESETS.length; j++){
					WINDMILL_PRESETS[j].className = "windmill-presets generic-menu-item";
				}
				WINDMILL_PRESETS[i].className = "windmill-presets generic-menu-item selected";
				let presetSliderSettings;
				switch(i){
					//	Default
					case 0:
						presetSliderSettings = [120,120,120,1, 120,120,120,1, 0.2, 120,120,120,1, 1.1];
						for(let k=0; k<windmill_sliders.length; k++){
							let presetValue = presetSliderSettings[k];
							windmill_sliders[k].noUiSlider.set(presetValue);
						}
						windmill_checkboxes[0].checked = true;
						break;
				}
			});
		}
	}

	createSliders();
	
	initPresets();

	//	Manually default to this preset
	WINDMILL_PRESETS[0].click();
}

function visualizeWindmill(){
	//	Create a new Canvas element and insert it into the DOM
	var canvasElement = document.createElement('canvas')
	canvasElement.setAttribute('id', 's');
	document.body.appendChild(canvasElement);
	canvasCtx = document.getElementById('s').getContext('2d');

	var rotation = 0;

	ANALYSER.fftSize = 512;

	var bufferLength = ANALYSER.frequencyBinCount;
	var dataArray = new Uint8Array(bufferLength);

	var grd;
	var radius, arcStart, arcEnd, WIDTH, HEIGHT;
	var expand;

	var background1_r, background1_g, background1_b, background1_a,
	background2_r, background2_g, background2_b, background2_a;

	var useRainbowBlades;
	var bladeStyle1, bladeStyle2;

	var chaos;

	function readSliders(){
		//	Get the color values from the slider settings
		//	Background 1 RGBA colors
		background1_r = Math.round(windmill_sliders[0].noUiSlider.get());
		background1_g = Math.round(windmill_sliders[1].noUiSlider.get());
		background1_b = Math.round(windmill_sliders[2].noUiSlider.get());
		background1_a = windmill_sliders[3].noUiSlider.get();

		//	Background 2 RGBA colors
		background2_r = Math.round(windmill_sliders[4].noUiSlider.get());
		background2_g = Math.round(windmill_sliders[5].noUiSlider.get());
		background2_b = Math.round(windmill_sliders[6].noUiSlider.get());
		background2_a = windmill_sliders[7].noUiSlider.get();

		//	Blade RGBA colors
		blade_r = Math.round(windmill_sliders[9].noUiSlider.get());
		blade_g = Math.round(windmill_sliders[10].noUiSlider.get());
		blade_b = Math.round(windmill_sliders[11].noUiSlider.get());
		blade_a = windmill_sliders[12].noUiSlider.get();

		chaos = windmill_sliders[13].noUiSlider.get();

		bladeWidth = windmill_sliders[8].noUiSlider.get();

		if(windmill_checkboxes[0].checked === false){
			document.getElementById('hidden-windmill-sliders').style = 'display: block;'
			useRainbowBlades = false;
		}
		else{
			document.getElementById('hidden-windmill-sliders').style = 'display: none;'
			useRainbowBlades = true;
		}
	}

	function drawWindmillBlades(){
		for(let i=1; i< 50; i+= 1){
			if(useRainbowBlades){
				bladeStyle1 = 'hsl(' + (360-(i*10)) + ',100%, 50%)';
				bladeStyle2 = 'hsl(' + (i*10) + ',100%, 50%)';
			}
			else{
				bladeStyle1 = 'rgba(' + blade_r + ',' + blade_g + ',' + blade_b + ',' + blade_a + ')';
				bladeStyle2 = 'rgba(' + blade_r + ',' + blade_g + ',' + blade_b + ',' + blade_a + ')';
			}
			radius = Math.round(20 + (Math.pow(i, 1.8))) + dataArray[i]*chaos;
			arcStart = (i/24) + rotation;
			arcEnd = (i/24) + rotation + Math.pow(dataArray[i*2]/200, 0.8);

			for(let j=1; j<7; j++){
				//	First "blade"
				canvasCtx.beginPath();
				canvasCtx.lineCap ='round';
				canvasCtx.strokeStyle = bladeStyle1;
				canvasCtx.arc(WIDTH/2, HEIGHT/2, radius + (j*bladeWidth), arcStart, arcEnd);
				canvasCtx.stroke();

				//	Second blade
				canvasCtx.beginPath();
				canvasCtx.lineCap ='round';
				canvasCtx.strokeStyle = bladeStyle2;
				canvasCtx.arc(WIDTH/2, HEIGHT/2, radius + (j*bladeWidth), arcStart + (Math.PI*2/4), arcEnd + (Math.PI*2/4));
				canvasCtx.stroke();

				//	Third Blade
				canvasCtx.beginPath();
				canvasCtx.lineCap ='round';
				canvasCtx.strokeStyle = bladeStyle1;
				canvasCtx.arc(WIDTH/2, HEIGHT/2, radius + (j*bladeWidth), arcStart + (Math.PI*2/4*2), arcEnd + (Math.PI*2/4*2));
				canvasCtx.stroke();

				//	Fourth Blade
				canvasCtx.beginPath();
				canvasCtx.lineCap ='round';
				canvasCtx.strokeStyle = bladeStyle2;
				canvasCtx.arc(WIDTH/2, HEIGHT/2, radius + (j*bladeWidth), arcStart + (Math.PI*2/4*3), arcEnd + (Math.PI*2/4*3));
				canvasCtx.stroke();
			}
		}
	}

	function drawSpiralRings(){
		expand = dataArray[45]*1.2;
		//	Black hole
		canvasCtx.beginPath();
		canvasCtx.arc(WIDTH/2, HEIGHT/2, expand+60, 0, 2 * Math.PI);
		canvasCtx.fillStyle = 'rgba(0,0,0,0.8)';
		canvasCtx.fill();

		//	White arc 1
		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
		canvasCtx.arc(WIDTH/2, HEIGHT/2, expand+65, Math.PI - rotation, Math.PI + 2 - rotation);
		canvasCtx.lineWidth = 4;
		canvasCtx.stroke();

		//	White arc 2
		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
		canvasCtx.arc(WIDTH/2, HEIGHT/2, expand+65, (Math.PI+2)+Math.PI - rotation, Math.PI*2 - rotation, true);
		//canvasCtx.lineWidth = 4;
		canvasCtx.stroke();

		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(0, 255, 100, 1.0)';
		canvasCtx.arc(WIDTH/2, HEIGHT/2, expand+250, 0 - rotation, 0.5 * Math.PI - rotation);
		//canvasCtx.lineWidth = 6;
		canvasCtx.stroke();

		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(150, 20, 100, 1.0)';
		canvasCtx.arc(WIDTH/2, HEIGHT/2, expand+250, 0.5 * Math.PI - rotation, Math.PI + 1 - rotation);
		canvasCtx.stroke();

		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(20, 20, 185, 1.0)';
		canvasCtx.arc(WIDTH/2, HEIGHT/2, expand+250, Math.PI+1 - rotation, 0 - rotation);
		canvasCtx.stroke();

		// White arc 3
		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
		canvasCtx.arc(WIDTH/2, HEIGHT/2, expand+430, Math.PI - rotation, Math.PI + 2 - rotation);
		//canvasCtx.lineWidth = 4;
		canvasCtx.stroke();

		//	White arc 4
		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
		canvasCtx.arc(WIDTH/2, HEIGHT/2, expand+430, (Math.PI+2)+Math.PI - rotation, Math.PI*2 - rotation, true);
		//canvasCtx.lineWidth = 4;
		canvasCtx.stroke();

		//	Tricolor circle 2
		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(0, 255, 100, 1.0)';
		canvasCtx.arc(WIDTH/2, HEIGHT/2, expand+620, 0 - rotation, 0.5 * Math.PI - rotation);
		//canvasCtx.lineWidth = 6;
		canvasCtx.stroke();

		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(150, 20, 100, 1.0)';
		canvasCtx.arc(WIDTH/2, HEIGHT/2, expand+620, 0.5 * Math.PI - rotation, Math.PI + 1 - rotation);
		canvasCtx.stroke();

		canvasCtx.beginPath();
		canvasCtx.strokeStyle = 'rgba(20, 20, 185, 1.0)';
		canvasCtx.arc(WIDTH/2, HEIGHT/2, expand+620, Math.PI+1 - rotation, 0 - rotation);
		canvasCtx.stroke();
	}

	function draw() {
		//	Count FPS
		showFPS();

		readSliders();

		//	Resize the canvas every frame to match the window size
		canvasCtx.canvas.width = WIDTH = window.innerWidth;
		canvasCtx.canvas.height = HEIGHT = window.innerHeight;

		//	Check if this is still the selected visualization style
		if(selected === 'Windmill'){
			requestAnimationFrame(draw);
		}
		//	Fills 'dataArray' with frequency data from the audio source.
		ANALYSER.getByteFrequencyData(dataArray);

		grd = canvasCtx.createLinearGradient(0, 0, 170, HEIGHT);
		//	Color the background
		grd.addColorStop(0, 'rgba(5, 5, 15, 1.0)');
		grd.addColorStop(1, 'rgba(5, 10, 25, 1.0)');
		//	Apply the gradient to the next rectangle to be drawn, then set it as the background
		canvasCtx.fillStyle = grd;
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

		rotation += dataArray[15]/8000;
		if(rotation < 2*Math.PI){
			 rotation += (Math.PI/4000);
		}
		else{
			rotation = 0;
		}

		drawWindmillBlades();

		drawSpiralRings();
		
	}
	draw();
}

//	**************	"Frequency Bars" Style Settings 	**************
function initFreqBarsStyleSettings(){
	//	All the "Frequency Bars" settings sliders
	freq_bars_sliders = document.getElementsByClassName('freq-bars-slider');
	freq_bars_values = document.getElementsByClassName('freq-bars-slider-value');
	//	Automation Checkboxes
	freq_bars_checkboxes = document.getElementsByClassName('freq-bars-responsive');
	const BARS_PRESETS = document.getElementsByClassName('bars-presets');

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

	function createSliders(){
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
	}

	//	**************PRESET STYLE SELECTION**************
	//	Store all the preset choices into an array so we can programatically add
	//	event listeners to each.
	function initPresets(){

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
						presetSliderSettings = [100, 200, 230, 1.0, 102, 102, 255, 0.5, 85, 100, 250, 1.0, 8, 0.40];
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
						presetSliderSettings = [255, 74, 243, 1.0, 0, 17, 20, 0.63, 55, 227, 101, 1.0, 8, 0.45];
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
						presetSliderSettings = [0, 0, 49, 1.0, 19, 0, 0, 0.85, 51, 8, 206, 0.32, 9, 0.40];
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
	}
	
	createSliders();

	initPresets();

	//	Manually default to this preset
	BARS_PRESETS[0].click();
}

function visualizeFrequencyBars(){
	//	Create a new Canvas element and insert it into the DOM
	var canvasElement = document.createElement('canvas')
	canvasElement.setAttribute('id', 'c');
	document.body.appendChild(canvasElement);
	var canvasCtx = document.getElementById('c').getContext('2d');

	//	Declare variables here to avoid garbage collection in the draw() loop for better performance
	var bar_count;
	var bufferLength;
	var dataArray;
	var grd;
	var background1_r, background1_g, background1_b, background1_a,
	background2_r, background2_g, background2_b, background2_a,
	barColor_r, barColor_g, barColor_b, barColor_a,
	barHeight_setting;
	var responsiveBarColor_r = responsiveBarColor_g = responsiveBarColor_b = 0;
	var barWidth, barHeight, x;

	function readSliders(){
		//	Read the value from the appropriate settings slider
		bar_count = Math.pow(2, Math.round(freq_bars_sliders[12].noUiSlider.get()));

		//	Get the color values from the slider settings
		//	Background 1 RGBA colors
		background1_r = Math.round(freq_bars_sliders[0].noUiSlider.get());
		background1_g = Math.round(freq_bars_sliders[1].noUiSlider.get());
		background1_b = Math.round(freq_bars_sliders[2].noUiSlider.get());
		background1_a = freq_bars_sliders[3].noUiSlider.get();

		//	Background 2 RGBA colors
		background2_r = Math.round(freq_bars_sliders[4].noUiSlider.get());
		background2_g = Math.round(freq_bars_sliders[5].noUiSlider.get());
		background2_b = Math.round(freq_bars_sliders[6].noUiSlider.get());
		background2_a = freq_bars_sliders[7].noUiSlider.get();

		//	Bar Color RGBA colors
		barColor_r = Math.round(freq_bars_sliders[8].noUiSlider.get());
		barColor_g = Math.round(freq_bars_sliders[9].noUiSlider.get());
		barColor_b = Math.round(freq_bars_sliders[10].noUiSlider.get());
		barColor_a = freq_bars_sliders[11].noUiSlider.get();

		//	Bar Height slider
		barHeight_setting = freq_bars_sliders[13].noUiSlider.get();

		//	Responsive Bar Colors
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
	}

	//	The 'meat' of this whole function :)
	function draw() {
		showFPS();

		//	Resize the canvas every frame to match the window size
		canvasCtx.canvas.width = WIDTH = window.innerWidth;
		canvasCtx.canvas.height = HEIGHT = window.innerHeight;
		//	Check if this is still the selected visualization style
		if(selected === 'Frequency Bars'){
			requestAnimationFrame(draw);
		}

		//	Get all the slider values before we render the visualizations
		readSliders();

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
		bufferLength = ANALYSER.frequencyBinCount;
		dataArray = new Uint8Array(bufferLength);
		//	Fills 'dataArray' with frequency data from the audio source.
		ANALYSER.getByteFrequencyData(dataArray);


		// Initialize the gradient color for the background
		grd = canvasCtx.createLinearGradient(0, 0, 170, HEIGHT);
		//	Color the background
		grd.addColorStop(0, 'rgba('+ background1_r +', '+ background1_g +', '+ background1_b +', '+ background1_a +')');
		grd.addColorStop(1, 'rgba('+ background2_r +', '+ background2_g +', '+ background2_b +', '+ background2_a +')');
		canvasCtx.fillStyle = grd;
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

		//	Draw the bars
		barWidth = (WIDTH / bufferLength);
		x = 0;
		for(let i = 0; i < bufferLength; i++){
			//	RGB needs to take integers, so we need to round 'barHeight'.
			barHeight = Math.round(barHeight_setting * (Math.max(((dataArray[i] * 4) - 250), 0)))+10;
			canvasCtx.fillStyle = 'rgba(' + ((dataArray[i]*responsiveBarColor_r) + barColor_r) + ','+ ((dataArray[i]*responsiveBarColor_g) + barColor_g) +', '+ ((dataArray[i]*responsiveBarColor_b) + barColor_b) +', '+ barColor_a +')';
			canvasCtx.fillRect(x,HEIGHT-barHeight/2-HEIGHT/2, barWidth, barHeight);
			x += barWidth + 1;
		}

		//canvasCtx.rotate(dataArray[25]/180);
	}
	draw();
}

/*
function visualizeWaveform(){
	//	Create a new Canvas element and insert it into the DOM
	var canvasElement = document.createElement('canvas')
	canvasElement.setAttribute('id', 'c');
	document.body.appendChild(canvasElement);
	canvasCtx = document.getElementById('c').getContext('2d');

	var stars = [];

	//	Create stars
	for(let i=0; i< 20; i++){
 		stars.push(new Star());
 	}

	function Star(){
		this.active = false;
	}

	Star.prototype.createStar = function(){
		this.x = WIDTH / 2;
		this.y = HEIGHT / 2;
		this.length = 1;
		this.vx = (Math.random() * 10 - 5)*5;
		this.vy = (Math.random() * 10 - 5)*5;
		this.gravity = 0.0;
		this.active = true;

		canvasCtx.beginPath();
			canvasCtx.moveTo(this.x + (Math.random() * 10)*2, this.y + (Math.random() * 10)*2)
			canvasCtx.lineTo(this.x+this.vx, this.y + this.vy)
		canvasCtx.strokeStyle = 'rgb(255,255,255)';
		canvasCtx.stroke();
	}

	Star.prototype.moveStar = function(){
		this.active = true;
		this.x += this.vx;
		this.y += this.vy;
		this.vy += this.gravity;
		this.length = Math.abs(this.length + 0.05);

		canvasCtx.beginPath();
			canvasCtx.moveTo(this.x, this.y);
			canvasCtx.lineTo(this.x+(this.vx*8), this.y + (this.vy*8))
		canvasCtx.strokeStyle = 'rgb(255,255,255)';
		canvasCtx.stroke();

		if(this.x >= WIDTH || this.x <= 0 || this.y >= HEIGHT || this.y <= 0){
			this.active = false;
		}
	}


	function draw() {
		showFPS();

		//	Resize the canvas every frame to match the window size
		canvasCtx.canvas.width = WIDTH = window.innerWidth;
		canvasCtx.canvas.height = HEIGHT = window.innerHeight;
		//	Check if this is still the selected visualization style
		if(selected === 'Waveform'){
			requestAnimationFrame(draw);
		}
		ANALYSER.fftSize = 256;

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

		for(let i=0; i< stars.length; i++){
			if(stars[i].active === true){
				stars[i].moveStar(i);
			}
			else{
				stars[i].createStar();
			}
		}
	}
	draw();
}
*/