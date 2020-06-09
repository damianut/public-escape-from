<?php

namespace App\Repository;

use App\Entity\PlayerMob;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method PlayerMob|null find($id, $lockMode = null, $lockVersion = null)
 * @method PlayerMob|null findOneBy(array $criteria, array $orderBy = null)
 * @method PlayerMob[]    findAll()
 * @method PlayerMob[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PlayerMobRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PlayerMob::class);
    }

    // /**
    //  * @return PlayerMob[] Returns an array of PlayerMob objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('m.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?PlayerMob
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
