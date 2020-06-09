<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Constraints;

class PlayerLoginType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('nick', Type\TextType::class, [
                'constraints' => [
                    new Constraints\NotBlank([
                        'message' => 'Nick nie może być pusty.',
                    ]),
                    new Constraints\Regex([
                        'pattern' => '/[\w\_]+/',
                        'message' => "Nick może składać się tylko z liter, cyfr i znaku '_'",
                    ]),
                ],
                'label' => 'nick:',
            ])
            ->add('password', Type\PasswordType::class, [
                'constraints' => [
                    new Constraints\NotBlank([
                        'message' => 'Hasło nie może być puste.',
                    ]),
                    new Constraints\Regex([
                        'pattern' => '/[\w\!\@\#\_]+/',
                        'message' => 'Podane hasło zawiera niedozwolone znaki. Może składać się ono wyłącznie z liter, cyfr oraz znaków: _!@#',
                    ]),
                ],
                'label' => 'hasło:',
                'mapped' => false,
            ])
            ->add('submit', Type\SubmitType::class, [
                'label' => 'Zaloguj',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'attr' => [
                'novalidate' => 'novalidate',
            ],
        ]);
    }
}
