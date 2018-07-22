<?php
namespace Application\Entity\Traits;

use Doctrine\Common\Collections\Collection;

trait TranslatableTrait
{

    public function getTranslations()
    {
        return $this->translations;
    }

    public function addTranslation($t)
    {
        if (! $this->translations->contains($t)) {
            $this->translations[] = $t;
            $t->setObject($this);
        }
    }

    public function addTranslations(Collection $translations)
    {
        foreach ($translations as $translation) {
            if (! $this->getTranslations()->contains($translation)) {
                $this->translations[] = $translation;
                $translation->setObject($this);
            }
        }
    }

    public function removeTranslations(Collection $translations)
    {
        foreach ($translations as $translation) {
            if ($this->getTranslations()->contains($translation)) {
                $this->getTranslations()->removeElement($translation);
                $translation->setObject(null);
            }
        }
    }
}