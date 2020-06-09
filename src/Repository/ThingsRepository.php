<?php

namespace App\Repository;

use App\Entity\Things;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Things|null find($id, $lockMode = null, $lockVersion = null)
 * @method Things|null findOneBy(array $criteria, array $orderBy = null)
 * @method Things[]    findAll()
 * @method Things[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ThingsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Things::class);
    }

    // /**
    //  * @return Things[] Returns an array of Things objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('d.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Things
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
