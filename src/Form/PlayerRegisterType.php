<?php

namespace App\Form;

use App\Entity\Player;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PlayerRegisterType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('email', Type\EmailType::class, [
                'label' => 'email:',
            ])
            ->add('nick', Type\TextType::class, [
                'label' => 'nick:',
            ])
            ->add('password', Type\PasswordType::class, [
                'label' => 'hasło:',
                'mapped' => false,
            ])
            ->add('submit', Type\SubmitType::class, [
                'label' => 'Zarejestruj',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'attr' => [
                'novalidate' => 'novalidate',
            ],
            'data_class' => Player::class,
        ]);
    }
}
