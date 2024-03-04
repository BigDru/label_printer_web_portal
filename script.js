document.addEventListener('DOMContentLoaded', function () {
    const labelSize = document.getElementById('label-size');
    const imageInput = document.getElementById('image-input');
    const textBox = document.getElementById('text-box');
    const printButton = document.getElementById('print-button');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    function get_dpi() {
        // Create an element with 1 inch width
        const div = document.createElement('div');
        div.style.width = '1in';
        // Append it to the body to get the actual size
        document.body.appendChild(div);
        // Get the client width in pixels
        const dpi = div.clientWidth;
        // Remove the element
        document.body.removeChild(div);

        return dpi;
    }

    const dpi = get_dpi();
    const mm_per_inch = 25.4;
    const dpmm = dpi / mm_per_inch;

    var img = null;
    var img_offsets = { x: 0, y: 0 };
    var label_w = 0;
    var label_h = 0;

    function get_pixel_for_mm(mm) {
        return dpmm * mm * window.devicePixelRatio;
    }

    // Function to update the canvas based on label size
    function update_canvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const sizes = {
            SmallLabelPrinter: { width: get_pixel_for_mm(50), height: get_pixel_for_mm(30), text: "50mm x 30mm" },
            LargeLabelPrinter: { width: get_pixel_for_mm(100), height: get_pixel_for_mm(150), text: "100mm x 150mm" },
        };

        label_w = sizes[labelSize.value].width;
        label_h = sizes[labelSize.value].height;

        // Calculate the position for the outline to be centered
        const x = (canvas.width - label_w) / 2;
        const y = (canvas.height - label_h) / 2;

        // Text
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(sizes[labelSize.value].text, canvas.width / 2, 25);

        if (img === null)
        {
            ctx.fillText(textBox.value, canvas.width / 2, canvas.height / 2);
        }
        else
        {
            var img_x = x + img_offsets.x - (img.width / 2) + label_w / 2;
            var img_y = y + img_offsets.y - (img.height / 2) + label_h / 2;

            ctx.drawImage(
                img,
                img_x,
                img_y,
                img.width,
                img.height);

            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(
                img_x,
                img_y,
                img.width,
                img.height);
            ctx.stroke();
            ctx.closePath();
        }

        // Draw the outline centered in the canvas
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(x, y, label_w, label_h);
        ctx.stroke();
        ctx.closePath();

        // Shade outside label
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, x, canvas.height);

        ctx.fillRect(x, 0, label_w, (canvas.height - label_h) / 2);
        ctx.fillRect(x, (canvas.height + label_h) / 2, label_w, (canvas.height - label_h) / 2);

        ctx.fillRect(x + label_w, 0, (canvas.width - label_w) / 2, canvas.height);
    }

    labelSize.addEventListener('change', update_canvas);

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            img = new Image();
            img.onload = function() {
                img_offsets.x = 0;
                img_offsets.y = 0;
                update_canvas();
                // Clear canvas and draw image
                //ctx.clearRect(0, 0, canvas.width, canvas.height);
                //ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                //updateText(); // Draw text over the image
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    textBox.addEventListener('input', update_canvas);

    printButton.addEventListener('click', function() {
        const selectedSize = labelSize.value;
        const imageData = canvas.toDataURL('image/jpeg', 1.0);

        // Replace with your actual server or printing script endpoint
        const printServerUrl = 'http://192.168.2.47:80/print_label';

        fetch(printServerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageData: imageData, size: selectedSize })
        })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            alert("Label printed successfully!");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            textBox.value = "";
            imageInput.value = null;
        })
        .catch(error => {
            console.error("Error:", error);
            alert("An error occurred. Please check the console and server script.");
        });
    });

    // Initialize canvas with default value
    update_canvas();
});
