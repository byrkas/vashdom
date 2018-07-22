<?php
namespace Application\Entity\Repository;

use Doctrine\ORM\EntityRepository;

class MetaTagsRepository extends EntityRepository
{
    public function getTotal($search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('COUNT(f.id) as cnt')
            ->from('Application\Entity\MetaTags', 'f');
        if (! empty($search)) {
            $query->andWhere('f.title like :search OR f.description like :search OR f.keywords like :search')->setParameter('search', '%' . $search . '%');
        }

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getList($start, $limit, $orderBy, $order, $search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('f.id', 'f.route', 'f.title', 'f.description', 'f.keywords', 'f.isEnabled', "CONCAT(f.created,'') as created")
            ->from('Application\Entity\MetaTags', 'f')
            ->setFirstResult($start)
            ->setMaxResults($limit);

        if (! empty($order) && ! empty($orderBy)) {
            $query->addOrderBy($orderBy, $order);
        }
        if (! empty($search)) {
            $query->andWhere('f.title like :search OR f.description like :search OR f.keywords like :search')->setParameter('search', '%' . $search . '%');
        }

        return $query->getQuery()->getArrayResult();
    }

    public function removeByIds($ids)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $res = $query->delete('Application\Entity\MetaTags', 'f')
            ->where('f.id in (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->execute();

        return $res;
    }

    public function getMetaTagsByPathHash($routeHash)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('m.title, m.description, m.keywords')
            ->from('Application\Entity\MetaTags', 'm')
            ->where('m.routeHash=:routeHash')
            ->andWhere('m.isEnabled=1')
            ->setParameter('routeHash', $routeHash);

        return $query->getQuery()->getOneOrNullResult();
    }
}