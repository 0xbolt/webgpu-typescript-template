@group(0) @binding(0) var<uniform> canvasSize: vec2f;
@group(0) @binding(1) var<uniform> brightness: f32;

struct VertexInput {
    @builtin(vertex_index) vertexIndex: u32,
    // @location(0) position: vec2f,
};

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    let h = sqrt(3.0) / 2;
    let factor = brightness;

    let vertices = array(
        vec2f(-0.5, -h/2),
        vec2f(0.5, -h/2),
        vec2f(0, h/2),
    );
    let colors = array(
        vec4f(1, 1, 1, 1),
        vec4f(1, 1, 1, 1),
        vec4f(1, 1, 1, 1),
    );

    let size = min(canvasSize.x, canvasSize.y);
    let k = f32(size) / vec2f(canvasSize);

    var output: VertexOutput;
    output.position = vec4f(vertices[input.vertexIndex] * k, 0, 1);
    output.color = colors[input.vertexIndex] * factor;
    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    return vec4f(input.color);
}
