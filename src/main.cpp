#include <SFML/Graphics.hpp>

#include "utils.h"
#include "vector.h"

int main()
{
    std::srand(static_cast<unsigned int>(std::time(NULL)));

    sf::RenderWindow window(sf::VideoMode(SCREEN_W, SCREEN_H, 32), "Raymarch", sf::Style::Titlebar);
    window.setVerticalSyncEnabled(true);

    sf::Sprite renderSprt;
    sf::RenderTexture renderTex;
    renderTex.create(SCREEN_W, SCREEN_H);
    renderTex.setSmooth(true);
    renderSprt.setTexture(renderTex.getTexture());
    renderTex.clear();

    sf::Vector3f camPos(0.f, 0.f, 0.f);

    sf::Shader* raymarch = new sf::Shader;
    raymarch->loadFromFile("res/raymarch.frag", sf::Shader::Fragment);
    raymarch->setUniform("texSize", sf::Vector2f((float)SCREEN_W, (float)SCREEN_H));

    while (window.isOpen())
    {
        sf::Event event;
        while (window.pollEvent(event))
        {
            if ((event.type == sf::Event::Closed) || ((event.type == sf::Event::KeyPressed) && (event.key.code == sf::Keyboard::Escape)))
            {
                window.close();
                break;
            }

            if ((event.type == sf::Event::KeyPressed))
            {
                if (event.key.code == sf::Keyboard::Space)
                {
                    camPos.y += .5f;
                }
                if (event.key.code == sf::Keyboard::Tab)
                {
                    camPos.y -= .5f;
                }
                if (event.key.code == sf::Keyboard::Q)
                {
                    camPos.x -= .5f;
                }
                if (event.key.code == sf::Keyboard::D)
                {
                    camPos.x += .5f;
                }
                if (event.key.code == sf::Keyboard::Z)
                {
                    camPos.z += .5f;
                }
                if (event.key.code == sf::Keyboard::S)
                {
                    camPos.z -= .5f;
                }
            }
        }

        raymarch->setUniform("camPos", camPos);
        window.draw(renderSprt, raymarch);
        window.display();
    }
    return EXIT_SUCCESS;
}
