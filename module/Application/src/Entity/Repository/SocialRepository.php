<?php
namespace Application\Entity\Repository;

use Doctrine\ORM\EntityRepository;

class SocialRepository extends EntityRepository
{
    public function getTotal($search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('COUNT(s.id) as cnt')
        ->from('Application\Entity\Social', 's');
        if(!empty($search)){
            $query->andWhere('s.link like :search')->setParameter('search', '%'.$search.'%');
        }

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getList($start, $limit, $orderBy, $order, $search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('s.id as id','s.link as link','s.type as type','s.sort as sort')
        ->from('Application\Entity\Social', 's')
        ->setFirstResult($start)
        ->setMaxResults($limit);

        if(!empty($order) && !empty($orderBy)){
            $query->addOrderBy($orderBy, $order);
        }
        if(!empty($search)){
            $query->andWhere('s.link like :search')->setParameter('search', '%'.$search.'%');
        }

        return $query->getQuery()->getArrayResult();
    }

    public function getListArray()
    {
        $data = [];
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('s.id','s.type')
        ->from('Application\Entity\Social', 's')
        ->orderBy('s.type','ASC');
        $results = $query->getQuery()->getArrayResult();

        foreach ($results as $entry){
            $data[$entry['id']] = $entry['type'];
        }
        return $data;
    }

    public function removeByIds($ids){
        $query = $this->getEntityManager()->createQueryBuilder();
        $res = $query->delete('Application\Entity\Social', 's')
        ->where('s.id in (:ids)')
        ->setParameter('ids',$ids)
        ->getQuery()
        ->execute();

        return $res;
    }

    public function getListForSite()
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select("s.link",'s.type')
        ->from('Application\Entity\Social', 's')
        ->orderBy('s.sort','ASC');

        return $query->getQuery()->getArrayResult();
    }
}