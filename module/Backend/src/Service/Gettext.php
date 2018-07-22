<?php
namespace Backend\Service;

class Gettext {

    const OUT_PO = 'po';
    const OUT_PHP = 'php';

    public static $allowedOutpus = array(
        self::OUT_PO,
        self::OUT_PHP
    );
    /**
     * Default scan the curnt directory, accept string as directory path or array or directories
     * Directory path mast end with '/'
     *
     * @var string
     */
    public $directory = './';

    /**
     * Pattern to match
     *
     * @var string
     */
    public $pattern = '/(%s)\((\'|\")(.+?)(\'|\")(,.*)?\)/';

    /**
     * Files extensions to scan, accept Array()
     *
     * @var array
     */
    public $file_extensions = array();

    /**
     * Default output file name will
     *
     * @var string
     */
    public $file_name = 'default.po';

    /**
     * Show output
     *
     * @var bool
     */
    public $verbose = false;

    /**
     * Output format
     *
     * @var string
     */
    public $outputFormat = self::OUT_PO;

    /**
     * Method prefixes to be scanned
     *
     * @var array
     */
    public $methodPrefixes = array(
        '__', '_e', '_t', '-\>t'
    );

    /**
     * Generates the file
     *
     * @return int
     */
    public function generate()
    {
        $pattern = sprintf($this->pattern, implode('|', $this->methodPrefixes));

        $scanner = new Scanner($this->directory, $pattern, $this->file_extensions, $this->verbose);
        $lines = $scanner->scanDir();

        /* $unique = array_unique($lines);
        $newUnique = [];
        foreach ($unique as $entry){
            if(!in_array($entry, $newUnique)){
                $tt = str_replace("\'", "'", $entry);
                if(!in_array($tt, $newUnique)){
                    $newUnique[] = $tt;
                }
            }
        }
        $lines = $newUnique; */

        $generator = $this->createGenerator($lines);
        $generator->create();

        return count($lines);
    }


    /**
     * Generator Factory
     *
     * @param $lines
     *
     * @return PoGenerator
     */
    protected function createGenerator($lines)
    {
        $generator = new PoGenerator();
        switch($this->outputFormat) {
            case self::OUT_PHP:
                $generator = new PhpGenerator();
                break;
        }
        return $generator->setLines($lines)->setFile($this->file_name);
    }

    /**
     * Set a directory to be scanned
     * Default is ./
     *
     * @param string $directory
     * @return Gettext
     */
    public function setDirectory($directory)
    {
        $this->directory = $directory;
        return $this;
    }

    /**
     * Set Own Regex Pattern (Use Carefully!)
     * Better use Method Prefixes Setter
     *
     * @param string $pattern
     *
     * @return Gettext
     */
    public function setPattern($pattern)
    {
        $this->pattern = $pattern;
        return $this;
    }

    /**
     * Set File extension to be scanned string (one) or array (multiple)
     *
     * @param string|array $fileExtensions
     *
     * @return Gettext
     */
    public function setFileExtensions($fileExtensions)
    {
        $this->file_extensions = is_array($fileExtensions) ? $fileExtensions : array($fileExtensions);
        return $this;
    }

    /**
     * Set output filename (full path)
     *
     * @param string $fileName
     * @return Gettext
     */
    public function setFileName($fileName)
    {
        $this->file_name = $fileName;
        return $this;
    }

    /**
     * Set to view list of scanned files
     *
     * @return Gettext
     */
    public function setVerboseOn()
    {
        $this->verbose = true;
        return $this;
    }

    /**
     * Set Output Format
     *
     * @param string $outputFormat
     *
     * @return Gettext
     */
    public function setOutputFormat($outputFormat)
    {
        if(!in_array($outputFormat, self::$allowedOutpus)) {
            trigger_error("Output format have to be onr of " . implode(', ', self::$allowedOutpus), E_USER_ERROR);
        }

        $this->outputFormat = $outputFormat;
        return $this;
    }

    /**
     * Set Method prefixes to be searched for. String (one) or Array (multiple)
     *
     * @param string|array $methodPrefixes ex: '__t' or ['__', '__t']
     *
     * @return Gettext
     */
    public function setMethodPrefixes($methodPrefixes)
    {
        $this->methodPrefixes = is_array($methodPrefixes) ? $methodPrefixes : array($methodPrefixes);
        return $this;
    }
}