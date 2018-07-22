<?php
namespace Application\Entity\Repository;

use Doctrine\ORM\EntityRepository;

class CityRepository extends EntityRepository
{

    public function getTotal($search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('COUNT(c.id) as cnt')
            ->from('Application\Entity\City', 'c')
            ->leftJoin('c.Region', 'r')
            ->leftJoin('c.Country', 'ct');
        if (! empty($search)) {
            $query->andWhere('c.name like :search OR ct.name like :search OR r.name like :search')->setParameter('search', '%' . $search . '%');
        }

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getList($start, $limit, $orderBy, $order, $search = '')
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('c.id as id', 'c.name as name', 'c.slug as slug', 'r.name as region', 'ct.name as country')
            ->from('Application\Entity\City', 'c')
            ->leftJoin('c.Region', 'r')
            ->leftJoin('c.Country', 'ct')
            ->setFirstResult($start)
            ->setMaxResults($limit);

        if (! empty($order) && ! empty($orderBy)) {
            $query->addOrderBy($orderBy, $order);
        }
        if (! empty($search)) {
            $query->andWhere('c.name like :search OR ct.name like :search OR r.name like :search')->setParameter('search', '%' . $search . '%');
        }

        return $query->getQuery()->getArrayResult();
    }

    public function getListArray()
    {
        $data = [];
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('c.id', 'c.name')
            ->from('Application\Entity\City', 'c')
            ->orderBy('c.name', 'ASC');
        $results = $query->getQuery()->getArrayResult();

        foreach ($results as $entry) {
            $data[$entry['id']] = $entry['name'];
        }
        return $data;
    }

    public function removeByIds($ids)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $res = $query->delete('Application\Entity\City', 'c')
            ->where('c.id in (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->execute();

        return $res;
    }

    public function findTranslation($object, $locale, $field)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('t')
            ->from('Application\Entity\Translation\CityTranslation', 't')
            ->where('t.object = :object AND t.locale = :locale AND t.field = :field')
            ->setParameter('object', $object)
            ->setParameter('locale', $locale)
            ->setParameter('field', $field);

        return $query->getQuery()->getOneOrNullResult();
    }
}