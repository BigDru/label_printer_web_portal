document.addEventListener('DOMContentLoaded', function () {
    const debug = false;

    const labelSize = document.getElementById('label-size');
    const imageInput = document.getElementById('image-input');
    const text_label_type = document.querySelectorAll('input[name="text-label-type"]');
    const text_justify_buttons_hor = document.querySelectorAll('.text-button-justify-hor');
    const text_justify_buttons_vert = document.querySelectorAll('.text-button-justify-vert');
    const text_font_size = document.getElementById('font-size');
    const text_ship_margin_top_label = document.getElementById('ship-to-margin-top-label');
    const text_ship_margin_left_label = document.getElementById('ship-to-margin-left-label');
    const text_ship_margin_top = document.getElementById('ship-to-margin-top');
    const text_ship_margin_left = document.getElementById('ship-to-margin-left');
    const text_margin_top = document.getElementById('text-margin-top');
    const text_margin_left = document.getElementById('text-margin-left');
    const textBox = document.getElementById('text-box');
    const printButton = document.getElementById('print-button');
    const resetButton = document.getElementById('image-reset-button');
    const removeButton = document.getElementById('image-remove-button');
    const fitButton = document.getElementById('image-fit-button');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const offset_x_p = document.getElementById('offset-x');
    const offset_y_p = document.getElementById('offset-y');
    const offset_w_p = document.getElementById('offset-w');
    const offset_h_p = document.getElementById('offset-h');

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
    var img_offsets = { x: 0, y: 0, w: 0, h: 0};
    const img_resize_controls_radius = 10;
    var label_w = 0;
    var label_h = 0;
    var label_file = "";
    var text_justify_horizontal = "left"; // Ship to default
    var text_justify_vertical = "top"; // Ship to default
    var mouse_x = 0;
    var mouse_y = 0;

    function get_pixel_for_mm(mm) {
        return dpmm * mm * window.devicePixelRatio;
    }

    function draw_img_lines()
    {
        var img_x = calc_img_x();
        var img_y = calc_img_y();
        var img_w = calc_img_w();
        var img_h = calc_img_h();

        ctx.lineWidth = 1;

        var radius = 10;

        ctx.beginPath();
        ctx.arc(
            img_x,
            img_y,
            img_resize_controls_radius,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(img_x + img_resize_controls_radius, img_y);
        ctx.lineTo(img_x + img_w - img_resize_controls_radius, img_y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
            img_x + img_w,
            img_y,
            img_resize_controls_radius,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(img_x + img_w, img_y + radius);
        ctx.lineTo(img_x + img_w, img_y + img_h - radius);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
            img_x + img_w,
            img_y + img_h,
            img_resize_controls_radius,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(img_x + img_w - img_resize_controls_radius, img_y + img_h);
        ctx.lineTo(img_x + img_resize_controls_radius, img_y + img_h);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
            img_x,
            img_y + img_h,
            img_resize_controls_radius,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(img_x, img_y + img_h - radius);
        ctx.lineTo(img_x, img_y + radius);
        ctx.stroke();
    }

    function calc_img_x()
    {
        if (img === null) return 0;

        return (canvas.width - (img.width + img_offsets.w)) / 2 + img_offsets.x;
    }

    function calc_img_y()
    {
        if (img === null) return 0;

        return (canvas.height - (img.height + img_offsets.h)) / 2 + img_offsets.y;
    }

    function calc_img_w()
    {
        if (img == null) return 0;

        return img.width + img_offsets.w;
    }

    function calc_img_h()
    {
        if (img == null) return 0;

        return img.height + img_offsets.h;
    }

    function update_img(draw_controls)
    {
        ctx.drawImage(
            img,
            calc_img_x(),
            calc_img_y(),
            calc_img_w(),
            calc_img_h());

        if (draw_controls)
        {
            draw_img_lines();
        }
    }

    function update_alignment() {
        text_justify_buttons_vert.forEach(b => {
            if (b.classList.contains('active'))
            {
                text_justify_vertical = b.id.split("-")[3];
            }
        });
        text_justify_buttons_hor.forEach(b => {
            if (b.classList.contains('active'))
            {
                text_justify_horizontal = b.id.split("-")[3];
            }
        });
    }

    function draw_debug_text() {
        if (!debug) return;

        ctx.textAlign = "left";
        ctx.fillText(`Mouse: (${mouse_x}, ${mouse_y})`, 5, 25);
        if (img != null)
        {
            ctx.fillText(`Img: (${calc_img_x()}, ${calc_img_y()}, ${calc_img_w()}, ${calc_img_h()})`, 5, 50);
        }
    }

    // Function to update the canvas based on label size
    function update_canvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";

        const sizes = {
            SmallLabelPrinter: { width: get_pixel_for_mm(50), height: get_pixel_for_mm(30), text: "50mm x 30mm", file: "small" },
            LargeLabelPrinter: { width: get_pixel_for_mm(100), height: get_pixel_for_mm(150), text: "100mm x 150mm", file: "large"},
        };

        label_w = sizes[labelSize.value].width;
        label_h = sizes[labelSize.value].height;
        label_file = sizes[labelSize.value].file;

        // Calculate the position for the outline to be centered
        const x = (canvas.width - label_w) / 2;
        const y = (canvas.height - label_h) / 2;

        // Text
        ctx.font = "20px sans-serif";
        draw_debug_text();
        ctx.textAlign = "center";
        ctx.fillText(sizes[labelSize.value].text, canvas.width / 2, 25);

        if (img === null)
        {
            update_alignment();

            let lines = textBox.value.split('\n');
            let font_size = parseInt(text_font_size.value);
            let font_face = "sans-serif";
            ctx.font = `${font_size}px ${font_face}`;

            let intraline_height_ratio = 1.2; // TODO: make control
            let multiline_line_height = font_size * intraline_height_ratio;

            // NOTE: Last line shouldn't have inter-line spacing
            let text_height = multiline_line_height * (lines.length - 1) + font_size;

            let text_y;
            let ship_to_y_offset;
            switch (text_justify_vertical)
            {
                case "top":
                    text_y = (canvas.height - label_h) / 2;
                    ship_to_y_offset = multiline_line_height + parseInt(text_ship_margin_top.value);
                    break;
                case "mid":
                    text_y = canvas.height / 2 - text_height / 2;
                    ship_to_y_offset = (multiline_line_height + parseInt(text_ship_margin_top.value)) / 2;
                    break;
                case "bot":
                    text_y = (canvas.height + label_h) / 2 - text_height;
                    ship_to_y_offset = 0;
                    break;
            }
            // NOTE: Fonts start at y and paint upwards (negative y)
            text_y += font_size;

            ctx.textAlign = text_justify_horizontal;
            let text_x;
            switch (text_justify_horizontal)
            {
                case "left":
                    text_x = (canvas.width - label_w) / 2;
                    break;
                case "center":
                    text_x = canvas.width / 2;
                    break;
                case "right":
                    text_x = (canvas.width + label_w) / 2;
                    break;
            }

            let text_label_type_value = document.querySelector('input[name="text-label-type"]:checked').value;
            if (text_label_type_value == "ship-to")
            {
                ctx.font = `bold ${font_size}px ${font_face}`;
                ctx.fillText(
                    "Ship to:",
                    text_x + parseInt(text_ship_margin_left.value),
                    (canvas.height - label_h) / 2 + font_size + parseInt(text_ship_margin_top.value));
                ctx.font = `${font_size}px ${font_face}`;

                // NOTE: Bold text has the same height as non-bold text
                text_y += ship_to_y_offset;
            }

            // Text
            text_x += parseInt(text_margin_left.value);
            text_y += parseInt(text_margin_top.value);
            let start_y = text_y;
            let max_width = 0;
            lines.forEach(line => {
                let metrics = ctx.measureText(line);

                if (metrics.width > max_width)
                {
                    max_width = metrics.width;
                }

                ctx.fillText(line, text_x, text_y);
                text_y += multiline_line_height;
            });

            if (debug)
            {
                ctx.lineWidth = 1;
                ctx.strokeStyle = "rgba(255, 0, 0, 1)";
                ctx.beginPath();

                // NOTE: debug_x represents the change in behavior for changing the horizontal justification
                let debug_x;
                switch (text_justify_horizontal)
                {
                    case "left":
                        debug_x = text_x;
                        break;
                    case "center":
                        debug_x = text_x - max_width / 2;
                        break;
                    case "right":
                        debug_x = text_x - max_width;
                        break;
                }

                ctx.rect(
                    debug_x,
                    // NOTE: Box needs to start at top of text
                    start_y - font_size,
                    max_width,
                    text_height);
                ctx.stroke();
            }
        }
        else
        {
            update_img(true);
        }

        // Draw the outline centered in the canvas
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";
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

        offset_x_p.textContent = `X offset: ${img_offsets.x}`;
        offset_y_p.textContent = `Y offset: ${img_offsets.y}`;
        offset_w_p.textContent = `Width offset: ${img_offsets.w}`;
        offset_h_p.textContent = `Height offset: ${img_offsets.h}`;
    }

    labelSize.addEventListener('change', update_canvas);

    text_label_type.forEach(radio => {
        radio.addEventListener('change', function() {
            let text_label_type_value = document.querySelector('input[name="text-label-type"]:checked').value;
            var is_ship_to = text_label_type_value == "ship-to";
            text_ship_margin_top.style.display = is_ship_to ? "inline-block" : "none";
            text_ship_margin_top_label.style.display = is_ship_to ? "inline-block" : "none";
            text_ship_margin_left.style.display = is_ship_to ? "inline-block" : "none";
            text_ship_margin_left_label.style.display = is_ship_to ? "inline-block" : "none";
            update_canvas();
        });
    });

    text_justify_buttons_hor.forEach(button => {
        button.addEventListener('click', function() {
            text_justify_buttons_hor.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            update_canvas();
        });
    });

    text_justify_buttons_vert.forEach(button => {
        button.addEventListener('click', function() {
            text_justify_buttons_vert.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            update_canvas();
        });
    });

    text_font_size.addEventListener('input', update_canvas);
    text_ship_margin_top.addEventListener('input', update_canvas);
    text_ship_margin_left.addEventListener('input', update_canvas);
    text_margin_top.addEventListener('input', update_canvas);
    text_margin_left.addEventListener('input', update_canvas);

    textBox.addEventListener('input', update_canvas);

    function set_cursor(mouse_x, mouse_y)
    {
        if (img != null)
        {
            var img_x = calc_img_x();
            var img_y = calc_img_y();
            var img_w = calc_img_w();
            var img_h = calc_img_h();

            if (mouse_x > img_x && mouse_x < img_x + img_w &&
                mouse_y > img_y && mouse_y < img_y + img_h)
            {
                canvas.style.cursor = "move";
            }
            else
            {
                canvas.style.cursor = "default";
            }

            // overwrite behavior
            const distance_from_top_left_control = Math.sqrt((mouse_x - img_x) ** 2 + (mouse_y - img_y) ** 2);
            if (distance_from_top_left_control < img_resize_controls_radius)
            {
                canvas.style.cursor = "se-resize";
            }

            const distance_from_top_right_control = Math.sqrt((mouse_x - (img_x + img_w)) ** 2 + (mouse_y - img_y) ** 2);
            if (distance_from_top_right_control < img_resize_controls_radius)
            {
                canvas.style.cursor = "sw-resize";
            }

            const distance_from_bottom_left_control = Math.sqrt((mouse_x - img_x) ** 2 + (mouse_y - (img_y + img_h)) ** 2);
            if (distance_from_bottom_left_control < img_resize_controls_radius)
            {
                canvas.style.cursor = "ne-resize";
            }

            const distance_from_bottom_right_control = Math.sqrt((mouse_x - (img_x + img_w)) ** 2 + (mouse_y - (img_y + img_h)) ** 2);
            if (distance_from_bottom_right_control < img_resize_controls_radius)
            {
                canvas.style.cursor = "nw-resize";
            }
        }
        else
        {
            canvas.style.cursor = "default";
        }
    }

    canvas.addEventListener('mousedown', function(e) {
        if (e.buttons == 1)
        {
            const canvas_rect = canvas.getBoundingClientRect();
            mouse_x = e.clientX - canvas_rect.x;
            mouse_y = e.clientY - canvas_rect.y;

            mouse_down_x = mouse_x;
            mouse_down_y = mouse_y;
        }
    });

    canvas.addEventListener('mousemove', function(e) {
        const canvas_rect = canvas.getBoundingClientRect();
        mouse_x = e.clientX - canvas_rect.x;
        mouse_y = e.clientY - canvas_rect.y;

        if (canvas.style.cursor != "default" &&
            e.buttons == 1)
        {
            var delta_x = mouse_x - mouse_down_x;
            var delta_y = mouse_y - mouse_down_y;

            if (canvas.style.cursor == "move")
            {
                img_offsets.x += delta_x;
                img_offsets.y += delta_y;
            }
            else if (canvas.style.cursor == "se-resize") // top left
            {
                // NOTE: image is scaled before it's translated so we only apply half the delta here
                img_offsets.x += delta_x / 2;
                img_offsets.y += delta_y / 2;

                img_offsets.w -= delta_x;
                img_offsets.h -= delta_y;
            }
            else if (canvas.style.cursor == "sw-resize") // top right
            {
                img_offsets.x += delta_x / 2;
                img_offsets.y += delta_y / 2;

                img_offsets.w += delta_x;
                img_offsets.h -= delta_y;
            }
            else if (canvas.style.cursor == "ne-resize") // bottom left
            {
                img_offsets.x += delta_x / 2;
                img_offsets.y += delta_y / 2;

                img_offsets.w -= delta_x;
                img_offsets.h += delta_y;
            }
            else if (canvas.style.cursor == "nw-resize") // bottom right
            {
                img_offsets.x += delta_x / 2;
                img_offsets.y += delta_y / 2;

                img_offsets.w += delta_x;
                img_offsets.h += delta_y;
            }

            mouse_down_x = mouse_x;
            mouse_down_y = mouse_y;
        }

        set_cursor(mouse_x, mouse_y);
        update_canvas();
    });

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            img = new Image();
            img.onload = function() {
                reset_image();
                fit_to_label();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    function reset_image()
    {
        img_offsets.x = 0;
        img_offsets.y = 0;
        img_offsets.w = 0;
        img_offsets.h = 0;
    }

    resetButton.addEventListener('click', function(){
        reset_image();
        update_canvas();
    });

    removeButton.addEventListener('click', function(){
        img = null;
        reset_image();
        update_canvas();
    });

    function fit_to_label()
    {
        if (img == null) return;

        if (calc_img_w() > label_w || calc_img_h() > label_h)
        {
            shrink_to_label();
        }
        else
        {
            grow_to_label();
        }
    }

    function shrink_to_label()
    {
        if (img == null) return;

        var w = calc_img_w();
        var h = calc_img_h();

        const aspect = w / parseFloat(h);

        if (w > label_w)
        {
            resize_w = w - label_w;
            resize_h = parseInt(resize_w / aspect);

            img_offsets.w -= resize_w;
            img_offsets.h -= resize_h;

            w = calc_img_w();
            h = calc_img_h();
        }

        if (h > label_h)
        {
            resize_h = h - label_h;
            resize_w = parseInt(resize_h * aspect);

            img_offsets.w -= resize_w;
            img_offsets.h -= resize_h;
        }

        img_offsets.x = 0;
        img_offsets.y = 0;

        update_canvas();
    }

    function grow_to_label()
    {
        if (img == null) return;

        var w = calc_img_w();
        var h = calc_img_h();

        const aspect = w / parseFloat(h);

        if (w < label_w)
        {
            resize_w = label_w - w;
            resize_h = parseInt(resize_w / aspect);

            img_offsets.w += resize_w;
            img_offsets.h += resize_h;

            w = calc_img_w();
            h = calc_img_h();
        }

        if (h < label_h)
        {
            resize_h = label_h - h;
            resize_w = parseInt(resize_h * aspect);

            img_offsets.w += resize_w;
            img_offsets.h += resize_h;
        }

        img_offsets.x = 0;
        img_offsets.y = 0;

        update_canvas();
    }

    fitButton.addEventListener('click', fit_to_label);

    printButton.addEventListener('click', function() {
        if (img != null)
        {
            ctx.fillStyle = "rgba(255, 255, 255, 1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(0, 0, 0, 1)";
            update_img(draw_controls=false);
        }

        const label_canvas = document.createElement("canvas");
        label_canvas.width = label_w;
        label_canvas.height = label_h;
        const label_ctx = label_canvas.getContext('2d');

        const x = (canvas.width - label_w) / 2;
        const y = (canvas.height - label_h) / 2;

        label_ctx.drawImage(canvas, x, y, label_w, label_h, 0, 0, label_w, label_h);

        const img_data_url = label_canvas.toDataURL('image/jpeg');

        fetch(`http://${window.location.hostname}:3000`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageData: img_data_url, label: label_file})
        })
        .then(response => response.json())
        .then(data => {
            console.log('The image was saved successfully:', data);
        })
        .catch(error => {
            console.error('Error saving the image:', error);
        });

        update_canvas();
    });

    // Initialize canvas with default value
    update_canvas();
});
