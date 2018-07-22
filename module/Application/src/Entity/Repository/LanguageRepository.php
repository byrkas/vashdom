<?php
namespace Application\Entity\Repository;

use Doctrine\ORM\EntityRepository;

class LanguageRepository extends EntityRepository
{
    public function getTotal($filter = [])
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('COUNT(l.id) as cnt')->from('Application\Entity\Language', 'l');

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getList($start, $limit, $orderBy, $order, $filter = [])
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('l.id as id', 'l.name as name','l.code as code','l.locale as locale','l.info as info')
            ->from('Application\Entity\Language', 'l')
            ->setFirstResult($start)
            ->setMaxResults($limit)
            ->groupBy('l.id');

        if (! empty($order) && ! empty($orderBy)) {
            $query->addOrderBy($orderBy, $order);
        }

        return $query->getQuery()->getArrayResult();
    }

    public function getListArray()
    {
        $data = [];
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('l.locale','l.name')
        ->from('Application\Entity\Language', 'l')
        ->orderBy('l.name','ASC');
        $results = $query->getQuery()->getArrayResult();

        foreach ($results as $entry){
            $data[$entry['locale']] = $entry['name'].' ('.$entry['locale'].')';
        }
        return $data;
    }


    public function getLanguagesByLocale($locales)
    {
        $data = [];
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('l.locale','l.code','l.name')
        ->from('Application\Entity\Language', 'l')
        ->where('l.locale IN (:locale)')
        ->setParameter('locale', $locales)
        ->orderBy('l.name','ASC');

        return $query->getQuery()->getArrayResult();
    }


    public function removeByIds($ids)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $res = $query->delete('Application\Entity\Language', 'l')
            ->where('l.id in (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->execute();

        return $res;
    }
}