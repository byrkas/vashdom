<?php
namespace Application\Entity\Repository;

use Doctrine\ORM\EntityRepository;

class SettingRepository extends EntityRepository
{
    public function getTotal($filter = [])
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('COUNT(s.id) as cnt')->from('Application\Entity\Setting', 's');

        return $query->getQuery()->getSingleScalarResult();
    }

    public function getList($start, $limit, $orderBy, $order, $filter = [])
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('s.id as id', 's.code as code', 's.value as value')
            ->from('Application\Entity\Setting', 's')
            ->setFirstResult($start)
            ->setMaxResults($limit)
            ->groupBy('s.id');

        if (! empty($order) && ! empty($orderBy)) {
            $query->addOrderBy($orderBy, $order);
        }

        return $query->getQuery()->getArrayResult();
    }

    public function getListArray()
    {
        $data = [];
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('s.id', 's.code as code', 's.value as value')
        ->from('Application\Entity\Setting', 's')
        ->orderBy('s.name','ASC');
        $results = $query->getQuery()->getArrayResult();

        foreach ($results as $entry){
            $data[$entry['id']] = $entry['code'];
        }
        return $data;
    }

    public function removeByIds($ids)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $res = $query->delete('Application\Entity\Setting', 's')
            ->where('s.id in (:ids)')
            ->setParameter('ids', $ids)
            ->getQuery()
            ->execute();

        return $res;
    }

    public function getValueByCode($code)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('s.value')
        ->from('Application\Entity\Setting', 's')
        ->where('s.code = :code')
        ->setParameter('code', $code)
        ->setMaxResults(1);

        $results = $query->getQuery()->getOneOrNullResult();
        if($results){
            return $results['value'];
        }
        return null;
    }

    public function findTranslation($object, $locale, $field)
    {
        $query = $this->getEntityManager()->createQueryBuilder();
        $query->select('t')
        ->from('Application\Entity\Translation\SettingTranslation', 't')
        ->where('t.object = :object AND t.locale = :locale AND t.field = :field')
        ->setParameter('object', $object)
        ->setParameter('locale', $locale)
        ->setParameter('field', $field);

        return $query->getQuery()->getOneOrNullResult();
    }
}