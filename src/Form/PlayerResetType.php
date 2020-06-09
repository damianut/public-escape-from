<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Constraints;

class PlayerResetType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('email', Type\EmailType::class, [
                'constraints' => [
                    new Constraints\NotBlank([
                        'message' => 'E-mail nie może być pusty.',
                    ]),
                    new Constraints\Email([
                        'message' => 'Wprowadzony tekst nie jest poprawnym adresem e-mail.',
                    ]),
                    ],
                'label' => 'email:',
            ])
            ->add('submit', Type\SubmitType::class, [
                'label' => 'Resetuj',
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
