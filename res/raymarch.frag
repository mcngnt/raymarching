uniform sampler2D texture;
uniform vec2 texSize;
uniform vec3 camPos;
uniform int tick;
uniform bool doLight;
uniform float blendFactor;

#define MAX_DIST 100
#define MAX_STEPS 100
#define MIN_DIST 0.1
#define K 2

vec3 colorMap[5] = vec3[](vec3(0.0, 0.0, 0.0),
                          vec3(1.0, 0.0, 0.0),
                          vec3(0.0, 1.0, 0.0),
                          vec3(0.0, 0.0, 1.0),
                          vec3(1.0, 1.0, 0.0));


float lenght(vec3 vec)
{
    return sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z);
}
vec3 norm(vec3 vec)
{
    float len = lenght(vec);
    if (len != 0)
    {
        return vec3(vec.x/len, vec.y/len, vec.z/len);
    }
    return vec;
}

vec4 sdf_min(vec4 vdista, vec4 vdistb)
{
    if (vdista.x <= vdistb.x)
    {
        return vdista;
    }
    return vdistb;
}

// float smooth_min(float a, float b, float k)
// {
//     float h = max(k - abs(a-b), 0.0)/k;
//     return min(a, b) - h*h*h*k*(1.0/6.0);
// }
vec2 smooth_min( float a, float b, float k )
{
    float h = max( k-abs(a-b), 0.0 )/k;
    float m = h*h*0.5;
    float s = m*k*(1.0/2.0);
    return (a<b) ? vec2(a-s,m) : vec2(b-s,1.0-m);
}

vec4 sdf_smooth_min(vec4 a, vec4 b, float k)
{
    vec2 sMinDist = smooth_min(a.x, b.x, k);
    float colorMixRatio = sMinDist.y;
    vec3 smoothCol =  a.yzw * (1 - colorMixRatio) + b.yzw * colorMixRatio;
    return vec4(sMinDist.x, smoothCol);
}

float sfd_sphere(vec3 pos, vec3 p, float s)
{
    return lenght(pos - p) - s;
}

float sdf_box(vec3 pos, vec3 p, vec3 b)
{
    vec3 q = abs(p) - b;
    return lenght(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sfd_inf_cylinder(vec3 pos, vec3 c)
{
    return length(pos.xy-c.xy)-c.z;
}

vec4 get_dist(vec3 pos)
{
    vec4 what = vec4(abs((pos.x + pos.y)/pos.z * pos.x*3.14), colorMap[1]);
    vec4 sphereDist = vec4(sfd_sphere(pos, vec3(1.0), 1.0), colorMap[2]);
    vec4 floorDist = vec4(pos.y, colorMap[3]);
    vec4 cube = vec4(sfd_inf_cylinder(pos, vec3(10.0, 3.0, 1.0)), colorMap[4]);
    // cube = floorDist;

    return sdf_smooth_min(sdf_smooth_min(sdf_smooth_min(floorDist, sphereDist, blendFactor), what, blendFactor), cube, blendFactor);
}

vec4 ray_march(vec3 campos, vec3 camdir)
{
    float dist = 0.f;
    vec3 pos;
    float stepDist;
    vec3 col = colorMap[0];
    vec4 getDistResult;
    for (int i = 0; i < MAX_STEPS; ++i)
    {
        pos = campos + camdir*dist;
        getDistResult = get_dist(pos);
        stepDist = getDistResult.x;
        col = getDistResult.yzw;
        dist += stepDist;
        if (dist > MAX_DIST)
        {
            col = colorMap[0];
            break;
        }
        if (stepDist < MIN_DIST)
        {
            break;
        }
    }
    return vec4(dist, col);
}

float shade(vec3 pos, vec3 dir, float min, float max, int maxStep)
{
    float t = 0.0;
    float h;
    float res = 1.0;
    for (int i = 0; i < maxStep; ++i)
    {
        h = get_dist(pos + dir*t).x;
        if (h < min)
        {
            return 0.0;
        }
        res = min(res, K*h/t);
        t += h;
        if (t > max)
        {
            return res;
        }
    }
    return res;
}

// float pix_

void main()
{
    vec4 pixel = vec4(0.f);
    vec2 pos = gl_TexCoord[0].xy*texSize;
    pos.y = texSize.y - pos.y;
    pos = (pos - texSize*0.5f)/texSize.y;
    vec3 uvDir = norm(vec3(pos.x, pos.y, 1));

    vec4 result = ray_march(camPos, uvDir);

	// vec3 lightPos = camPos + vec3(0, 1, 0);
    vec3 resultPos = result.x * uvDir + camPos;
    float shadeRatio = 1.0;
    if (doLight)
    {
        shadeRatio = shade(resultPos, vec3(0,1,0), 0.001, 60.0, 60);
    }
    vec4 returnCol = vec4(result.yzw, 1);

    pixel = vec4(vec3(1) * shadeRatio, 1.f) * returnCol;


    gl_FragColor = gl_Color * pixel;
}