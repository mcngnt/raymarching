uniform sampler2D texture;
uniform vec2 texSize;
uniform vec3 camPos;

#define MAX_DIST 100
#define MAX_STEPS 100
#define MIN_DIST 0.1

// int domod(int a, int b)
// {
//     return a - a - (b * floor(a/b))
// }
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

vec2 sdf_min(vec2 vdista, vec2 vdistb)
{
    if (vdista.x <= vdistb.x)
    {
        return vdista;
    }
    return vdistb;
}

vec2 get_dist(vec3 pos)
{
    vec2 what = vec2(abs((pos.x + pos.y)/pos.z * pos.x*3.14), 1);
    vec2 sphereDist = vec2(lenght(pos - vec3(1.f)) - 1.f, 2);
    vec2 floorDist = vec2(pos.y, 3);

    return sdf_min(sdf_min(floorDist, sphereDist), what);
}

vec2 ray_march(vec3 campos, vec3 camdir)
{
    float dist = 0.f;
    vec3 pos;
    float stepDist;
    float id;
    vec2 getDistResult;


    for (int i = 0; i < MAX_STEPS; ++i)
    {
        // pos = add_vec_v(camPosVec, mult_scalar_v(camDirVec, dist));
        pos = campos + camdir*dist;
        getDistResult = get_dist(pos);
        stepDist = getDistResult.x;
        id = getDistResult.y;
        dist += stepDist;
        if (dist > MAX_DIST)
        {
            id = 0.f;
            break;
        }
        if (stepDist < MIN_DIST)
        {
            break;
        }
    }
    return vec2(dist, id);
}

// float pix_

void main()
{
    // vec4 pixel = texture2D(texture, gl_TexCoord[0].xy);
    vec4 pixel = vec4(0.f);
    vec2 pos = gl_TexCoord[0].xy*texSize;
    pos.y = texSize.y - pos.y;
    pos = (pos - texSize*0.5f)/texSize.y;
    // if (mod(int(gl_TexCoord[0].x*texSize.x),2) == 1 && mod(int(gl_TexCoord[0].y*texSize.y),2) == 1)
    // {
    //     pixel = vec4(1.f);
    // }
    // vec2 pos = vec2(int(texSize.x * gl_TexCoord[0].x), int(texSize.y * gl_TexCoord[0].y));
    // if (gl_TexCoord[0].x>0.5f && gl_TexCoord[0].y>0.5f)
    // {
    //     pixel = vec4(1.f);
    // }
    // if ( mod(pos.x,2) == 0 && mod(pos.y,2) == 0 )
    // {
    //     pixel = vec4(1.f);
    // }
    // vec3 camPos = vec3(1.f);
    vec3 uvDir = norm(vec3(pos.x, pos.y, 1));

    vec2 result = ray_march(camPos, uvDir);

    int id = int(result.y);

    vec4 returnCol = vec4(0.f, 0.f, 0.f, 1.f);
    if (id == 1)
    {
        returnCol = vec4(1.f, 0.f, 0.f, 1.f);
    }
    if (id == 2)
    {
        returnCol = vec4(0., 1.f, 0.f, 1.f);
    }
    if (id == 3)
    {
        returnCol = vec4(0.f, 0.f, 1.f, 1.f);
    }

    pixel = vec4(vec3(1 - result.x * 0.05), 1.f) * returnCol;


    gl_FragColor = gl_Color * pixel;
}