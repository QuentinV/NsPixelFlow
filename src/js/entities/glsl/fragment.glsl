varying float vDistance;

uniform vec3 startColor;
uniform vec3 endColor;
uniform bool animateShadows;
uniform bool useVaryingColors;
varying vec4 v_color;

float circle(in vec2 _st,in float _radius){
  vec2 dist=_st-vec2(.5);
  return 1.-smoothstep(_radius-(_radius*.01),
  _radius+(_radius*.01),
  dot(dist,dist)*4.);
}

void main(){
  if ( useVaryingColors ) {
    gl_FragColor = v_color;
  } else {
      vec3 color=vec3(1.);
      color = mix(startColor,endColor,vDistance);

      if ( animateShadows ) {
        vec2 uv = vec2(gl_PointCoord.x,1.-gl_PointCoord.y);
        vec3 circ = vec3(circle(uv,1.));
        gl_FragColor=vec4(color,circ.r * vDistance);
      } else {
        gl_FragColor=vec4(color, 1.0);
      }
  } 
}